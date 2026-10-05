const express = require('express');
const app = express();
app.use(express.json());

// ✅ Aapka Naya Active Google Sheet Webhook URL
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbxJNjlfz3n3OEbQ2iz49ICtId02Wc2McWj_GsgKVyo312XnJQyddj1hz4HW0fN3Iw/exec";

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>City Dental Clinic | Instant Booking</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #0f172a, #1e293b); color: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
        .clinic-card { background: #ffffff; color: #1e293b; padding: 35px; border-radius: 16px; width: 420px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        .badge { background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block; margin-bottom: 10px; }
        h2 { margin: 0 0 5px 0; color: #0284c7; font-size: 24px; }
        p.sub { margin: 0 0 20px 0; color: #64748b; font-size: 14px; }
        label { display: block; margin-top: 14px; font-size: 13px; font-weight: 600; color: #334155; }
        input, select { width: 100%; padding: 11px; margin-top: 5px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 14px; box-sizing: border-box; }
        button { width: 100%; padding: 14px; margin-top: 22px; background: #0284c7; color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 16px; cursor: pointer; transition: 0.2s; }
        button:hover { background: #0369a1; }
        .status-box { margin-top: 18px; padding: 12px; border-radius: 8px; display: none; font-size: 14px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="clinic-card">
        <span class="badge">⚡ 24/7 Automated Reception</span>
        <h2>🦷 City Dental Clinic</h2>
        <p class="sub">Book your appointment & get instant CRM confirmation.</p>

        <label>Patient Full Name</label>
        <input type="text" id="name" placeholder="e.g. Rahul Sharma" required />

        <label>WhatsApp Number (with 91)</label>
        <input type="text" id="number" placeholder="919876543210" required />

        <label>Select Treatment</label>
        <select id="service">
          <option value="Root Canal & Pain Relief">Root Canal & Pain Relief</option>
          <option value="Teeth Whitening / Cleaning">Teeth Whitening / Cleaning</option>
          <option value="General Dental Checkup">General Dental Checkup</option>
        </select>

        <label>Preferred Time Slot</label>
        <select id="slot">
          <option value="Morning (10:00 AM - 1:00 PM)">Morning (10:00 AM - 1:00 PM)</option>
          <option value="Evening (5:00 PM - 8:00 PM)">Evening (5:00 PM - 8:00 PM)</option>
        </select>

        <button onclick="bookAppointment()" id="btn">📅 Confirm Appointment Now</button>
        <div id="status" class="status-box"></div>
      </div>

      <script>
        async function bookAppointment() {
          const btn = document.getElementById('btn');
          const status = document.getElementById('status');
          const name = document.getElementById('name').value;
          const number = document.getElementById('number').value;
          const service = document.getElementById('service').value;
          const slot = document.getElementById('slot').value;

          if(!name || !number) { alert("Please enter Name and WhatsApp Number!"); return; }

          btn.innerText = "⏳ Confirming Booking...";
          btn.disabled = true;

          const res = await fetch('/api/book-appointment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, number, service, slot })
          });
          const data = await res.json();
          
          status.style.display = "block";
          if (data.success) {
            status.style.background = "#dcfce7";
            status.style.color = "#166534";
            status.innerHTML = "✅ <b>Appointment Confirmed!</b><br>Saved with Auto-Design in Doctor's Google Sheet CRM!";
            document.getElementById('name').value = "";
            document.getElementById('number').value = "";

            // ⏱️ 4 Second baad green box apne aap band ho jayega!
            setTimeout(() => {
              status.style.display = "none";
            }, 4000);
          } else {
            status.style.background = "#fee2e2";
            status.style.color = "#991b1b";
            status.innerHTML = "❌ Error: " + data.error;
          }
          btn.innerText = "📅 Confirm Appointment Now";
          btn.disabled = false;
        }
      </script>
    </body>
    </html>
  `);
});

app.post('/api/book-appointment', async (req, res) => {
  try {
    const { name, number, service, slot } = req.body;

    await fetch(GOOGLE_SHEET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        number: number,
        callType: name, // ✅ Sirf saaf Patient Name jayega
        message: service + " (" + slot + ")"
      })
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('🏥 Clinic Automation Server Live on http://localhost:' + PORT));
