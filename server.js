const express = require('express');
const app = express();
app.use(express.json());

// ✅ Final Synced Google Sheet CRM Webhook URL
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbxAAop1YSYbqU5gwcIrrJ0ngz-YCpbExGPkoFzQHPqck0DqpmQi5gsLJyvm3zxyEhzG/exec";

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>City Dental Clinic | Instant Booking & Bill</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #0f172a, #1e293b); color: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; }
        .clinic-card { background: #ffffff; color: #1e293b; padding: 35px; border-radius: 16px; width: 420px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        .badge { background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block; margin-bottom: 10px; }
        h2 { margin: 0 0 5px 0; color: #0284c7; font-size: 24px; }
        p.sub { margin: 0 0 20px 0; color: #64748b; font-size: 14px; }
        label { display: block; margin-top: 14px; font-size: 13px; font-weight: 600; color: #334155; }
        input, select { width: 100%; padding: 11px; margin-top: 5px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 14px; box-sizing: border-box; }
        button { width: 100%; padding: 14px; margin-top: 22px; background: #0284c7; color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 16px; cursor: pointer; transition: 0.2s; }
        button:hover { background: #0369a1; }
        
        /* 🧾 Printable Appointment Receipt Styling */
        .receipt-box { margin-top: 22px; padding: 18px; border: 2px dashed #0284c7; border-radius: 12px; background: #f8fafc; display: none; text-align: left; }
        .receipt-header { text-align: center; border-bottom: 1px solid #cbd5e1; padding-bottom: 10px; margin-bottom: 12px; }
        .receipt-header h3 { margin: 0; color: #0f172a; font-size: 18px; }
        .receipt-row { display: flex; justify-content: space-between; font-size: 13.5px; margin: 7px 0; color: #334155; }
        .receipt-total { border-top: 1px solid #cbd5e1; padding-top: 10px; margin-top: 10px; font-size: 16px; font-weight: bold; color: #166534; display: flex; justify-content: space-between; }
        .print-btn { background: #16a34a; margin-top: 14px; padding: 10px; font-size: 14px; }
        .print-btn:hover { background: #15803d; }

        /* Print Media Query: Sirf Receipt Print Hogi */
        @media print {
          body { background: #fff; }
          .form-section, .print-btn, .badge { display: none !important; }
          .clinic-card { box-shadow: none; width: 100%; padding: 0; }
          .receipt-box { display: block !important; border: 2px solid #000; }
        }
      </style>
    </head>
    <body>
      <div class="clinic-card">
        <div class="form-section">
          <span class="badge">⚡ 24/7 Automated Reception</span>
          <h2>🦷 City Dental Clinic</h2>
          <p class="sub">Book your appointment & get instant Bill Receipt.</p>

          <label>Patient Full Name</label>
          <input type="text" id="name" placeholder="e.g. Rahul Sharma" required />

          <label>WhatsApp Number (with 91)</label>
          <input type="text" id="number" placeholder="919876543210" required />

          <label>Select Treatment</label>
          <select id="service">
            <option value="Root Canal & Pain Relief">Root Canal & Pain Relief (₹2,500)</option>
            <option value="Teeth Whitening / Cleaning">Teeth Whitening / Cleaning (₹1,200)</option>
            <option value="General Dental Checkup">General Dental Checkup (₹500)</option>
          </select>

          <label>Preferred Time Slot</label>
          <select id="slot">
            <option value="Morning (10:00 AM - 1:00 PM)">Morning (10:00 AM - 1:00 PM)</option>
            <option value="Evening (5:00 PM - 8:00 PM)">Evening (5:00 PM - 8:00 PM)</option>
          </select>

          <button onclick="bookAppointment()" id="btn">📅 Confirm Appointment Now</button>
        </div>

        <!-- 🧾 Instant Digital Bill & Token Slip -->
        <div id="receipt" class="receipt-box">
          <div class="receipt-header">
            <h3>🦷 CITY DENTAL CLINIC</h3>
            <small style="color:#16a34a; font-weight:bold;">✅ Official Appointment & Bill Slip</small>
          </div>
          <div class="receipt-row"><span><b>Token ID:</b></span> <span id="r-token" style="color:#0284c7; font-weight:bold;"></span></div>
          <div class="receipt-row"><span><b>Patient Name:</b></span> <span id="r-name"></span></div>
          <div class="receipt-row"><span><b>WhatsApp:</b></span> <span id="r-number"></span></div>
          <div class="receipt-row"><span><b>Treatment:</b></span> <span id="r-service"></span></div>
          <div class="receipt-row"><span><b>Time Slot:</b></span> <span id="r-slot"></span></div>
          <div class="receipt-total">
            <span>Estimated Fee:</span>
            <span id="r-fee"></span>
          </div>
          <button class="print-btn" onclick="printAndClose()">🖨️ Print / Save PDF Receipt</button>
        </div>
      </div>

      <script>
        async function bookAppointment() {
          const btn = document.getElementById('btn');
          const receipt = document.getElementById('receipt');
          const name = document.getElementById('name').value;
          const number = document.getElementById('number').value;
          const service = document.getElementById('service').value;
          const slot = document.getElementById('slot').value;

          if(!name || !number) { alert("Please enter Name and WhatsApp Number!"); return; }

          btn.innerText = "⏳ Generating Token & Bill...";
          btn.disabled = true;

          const res = await fetch('/api/book-appointment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, number, service, slot })
          });
          const data = await res.json();
          
          if (data.success) {
            document.getElementById('r-token').innerText = data.token;
            document.getElementById('r-name').innerText = name;
            document.getElementById('r-number').innerText = number;
            document.getElementById('r-service').innerText = service;
            document.getElementById('r-slot').innerText = slot;
            document.getElementById('r-fee').innerText = data.fee;
            
            receipt.style.display = "block";
            document.getElementById('name').value = "";
            document.getElementById('number').value = "";
          } else {
            alert("❌ Error: " + data.error);
          }
          btn.innerText = "📅 Confirm Appointment Now";
          btn.disabled = false;
        }

        function printAndClose() {
          window.print();
          setTimeout(() => {
            document.getElementById('receipt').style.display = "none";
          }, 2000);
        }
      </script>
    </body>
    </html>
  `);
});

app.post('/api/book-appointment', async (req, res) => {
  try {
    const { name, number, service, slot } = req.body;

    let fee = "₹500";
    if (service.includes("Root Canal")) fee = "₹2,500";
    else if (service.includes("Teeth Whitening")) fee = "₹1,200";

    const randomNum = Math.floor(100 + Math.random() * 900);
    const token = "#CDC-" + randomNum;

    await fetch(GOOGLE_SHEET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        number: number,
        callType: name,
        message: service + " (" + slot + ")",
        token: token,
        fee: fee
      })
    });

    res.json({ 
      success: true, 
      token: token, 
      fee: fee 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('🏥 Clinic Automation Server Live on http://localhost:' + PORT));
