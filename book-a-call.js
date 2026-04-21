(() => {
  const overlay   = document.getElementById('bacOverlay');
  const closeBtn  = document.getElementById('bacClose');
  const doneBtn   = document.getElementById('bacDone');
  const form      = document.getElementById('bacForm');
  const success   = document.getElementById('bacSuccess');
  const submitBtn = document.getElementById('bacSubmit');

  // ── State ──────────────────────────────────────────────────────
  let selectedDate = null;
  let selectedTime = null;
  let calYear, calMonth;

  // ── Open / Close ───────────────────────────────────────────────
  function openModal() {
    resetModal();
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function resetModal() {
    goToPanel(1);
    form.reset();
    success.classList.remove('active');
    form.style.display = '';
    document.querySelector('.bac-header').style.display = '';
    document.querySelector('.bac-steps').style.display = '';
    selectedDate = null;
    selectedTime = null;
    document.getElementById('bacSelectedDate').textContent = 'No date selected';
    document.querySelectorAll('.bac-slot').forEach(s => s.classList.remove('active'));
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
    buildCalendar();
  }

  document.querySelectorAll('.bac-trigger').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); openModal(); });
  });

  closeBtn.addEventListener('click', closeModal);
  doneBtn.addEventListener('click', closeModal);

  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // ── Step Navigation ────────────────────────────────────────────
  function goToPanel(n) {
    document.querySelectorAll('.bac-panel').forEach(p => p.classList.remove('active'));
    const target = document.querySelector(`.bac-panel[data-panel="${n}"]`);
    if (target) target.classList.add('active');

    document.querySelectorAll('.bac-step').forEach(s => {
      const num = parseInt(s.dataset.step);
      s.classList.toggle('active', num === n);
      s.classList.toggle('done', num < n);
    });
  }

  document.querySelectorAll('[data-next]').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = parseInt(btn.dataset.next);
      if (next === 2 && !validateStep1()) return;
      if (next === 3 && !selectedDate) {
        showFieldError(document.getElementById('bacSelectedDate'), 'Please select a date.');
        return;
      }
      goToPanel(next);
    });
  });

  document.querySelectorAll('[data-back]').forEach(btn => {
    btn.addEventListener('click', () => goToPanel(parseInt(btn.dataset.back)));
  });

  // ── Step 1 Validation ──────────────────────────────────────────
  function validateStep1() {
    const name  = document.getElementById('bacName');
    const email = document.getElementById('bacEmail');
    const phone = document.getElementById('bacPhone');
    let ok = true;

    clearErrors();

    if (!name.value.trim()) { showFieldError(name, 'Name is required.'); ok = false; }
    if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      showFieldError(email, 'Valid email required.'); ok = false;
    }
    if (!phone.value.trim()) { showFieldError(phone, 'Phone number is required.'); ok = false; }

    return ok;
  }

  function showFieldError(el, msg) {
    el.classList.add('error');
    let err = el.parentElement.querySelector('.bac-error');
    if (!err) {
      err = document.createElement('span');
      err.className = 'bac-error';
      el.parentElement.appendChild(err);
    }
    err.textContent = msg;
  }

  function clearErrors() {
    document.querySelectorAll('.bac-field__input.error').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.bac-error').forEach(el => el.remove());
  }

  // ── Calendar ───────────────────────────────────────────────────
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  function buildCalendar() {
    const now = new Date();
    calYear  = calYear  ?? now.getFullYear();
    calMonth = calMonth ?? now.getMonth();

    document.getElementById('calMonthLabel').textContent = `${MONTHS[calMonth]} ${calYear}`;

    const grid  = document.getElementById('calGrid');
    grid.innerHTML = '';

    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const today = new Date(); today.setHours(0,0,0,0);

    for (let i = 0; i < firstDay; i++) {
      const blank = document.createElement('span');
      blank.className = 'bac-cal__day bac-cal__day--blank';
      grid.appendChild(blank);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'bac-cal__day';
      btn.textContent = d;

      const date = new Date(calYear, calMonth, d);
      date.setHours(0,0,0,0);

      if (date < today || date.getDay() === 0) {
        btn.classList.add('disabled');
        btn.disabled = true;
      } else {
        if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
          btn.classList.add('selected');
        }
        btn.addEventListener('click', () => selectDate(date, btn));
      }

      grid.appendChild(btn);
    }
  }

  function selectDate(date, btn) {
    selectedDate = date;
    document.querySelectorAll('.bac-cal__day').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    const label = date.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
    document.getElementById('bacSelectedDate').textContent = `Selected: ${label}`;
    document.getElementById('bacSelectedDate').classList.add('has-date');
  }

  document.getElementById('calPrev').addEventListener('click', () => {
    const now = new Date();
    if (calMonth === now.getMonth() && calYear === now.getFullYear()) return;
    calMonth--;
    if (calMonth < 0) { calMonth = 11; calYear--; }
    buildCalendar();
  });

  document.getElementById('calNext').addEventListener('click', () => {
    calMonth++;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    buildCalendar();
  });

  buildCalendar();

  // ── Time Slots ─────────────────────────────────────────────────
  document.querySelectorAll('.bac-slot').forEach(slot => {
    slot.addEventListener('click', () => {
      document.querySelectorAll('.bac-slot').forEach(s => s.classList.remove('active'));
      slot.classList.add('active');
      selectedTime = slot.dataset.time;
    });
  });

  // ── Form Submit ────────────────────────────────────────────────
  form.addEventListener('submit', async e => {
    e.preventDefault();

    if (!selectedTime) {
      const slotsEl = document.getElementById('bacSlots');
      let err = slotsEl.parentElement.querySelector('.bac-error');
      if (!err) {
        err = document.createElement('span');
        err.className = 'bac-error';
        slotsEl.parentElement.insertBefore(err, slotsEl.nextSibling);
      }
      err.textContent = 'Please select a time slot.';
      return;
    }

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    const body = {
      name:    document.getElementById('bacName').value.trim(),
      email:   document.getElementById('bacEmail').value.trim(),
      phone:   document.getElementById('bacPhone').value.trim(),
      brand:   document.getElementById('bacBrand').value.trim(),
      message: document.getElementById('bacMessage').value.trim(),
      date:    selectedDate.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' }),
      time:    selectedTime,
    };

    try {
      const res = await fetch('/api/book-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Server error');

      form.style.display = 'none';
      document.querySelector('.bac-header').style.display = 'none';
      document.querySelector('.bac-steps').style.display = 'none';

      document.getElementById('bacSuccessDetails').innerHTML = `
        <div class="bac-success__row"><span>📅</span><strong>${body.date}</strong></div>
        <div class="bac-success__row"><span>🕐</span><strong>${body.time} PKT</strong></div>
        <div class="bac-success__row"><span>✉️</span><strong>${body.email}</strong></div>
      `;

      success.classList.add('active');
    } catch {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      alert('Something went wrong. Please try again or email us directly.');
    }
  });
})();
