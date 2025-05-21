
        const clockEl = document.querySelector(".clock");
        const countdownEl = document.querySelector(".countdown");
        const messageEl = document.getElementById("message");
        const bannerEl = document.getElementById("banner");
        const commandInput = document.getElementById("commandInput");
        const settingsPanel = document.getElementById("settingsPanel");
        const calendarPanel = document.getElementById("calendarPanel");
        const alarmsPanel = document.getElementById("alarmsPanel");
        const bgToggle = document.getElementById("bgToggle");
        const monthYearEl = document.getElementById("monthYear");
        const calendarDaysEl = document.getElementById("calendarDays");
        const bgImageUpload = document.getElementById("bgImageUpload");
        const partyPopperToggle = document.getElementById("partyPopperToggle");
        const partyPopperImageUpload = document.getElementById("partyPopperImageUpload");
        const alarmsListEl = document.getElementById("alarmsList");

        let currentCustomBannerText = localStorage.getItem("bannerText") || "¡Es la Hora Mágica!";
        let confettiActive = false;

        // Calendar variables
        let currentMonth = new Date().getMonth();
        let currentYear = new Date().getFullYear();
        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

        // Alarms Array
        // Se carga del localStorage, si no existe, se inicializa con la alarma por defecto
        let alarms = JSON.parse(localStorage.getItem("alarms"));
        if (!alarms || alarms.length === 0) { // Si no hay alarmas guardadas o la lista está vacía
            alarms = [{ id: Date.now(), name: "Hora de irse", hour: 13, minute: 39, second: 40, message: "¡Hora de irse!" }];
            saveAlarms(); // Guarda la alarma por defecto en localStorage
        }


        // Party Popper Image and setting
        let partyPopperImageBase64 = localStorage.getItem("partyPopperImage");
        let partyPopperEnabled = localStorage.getItem("partyPopperEnabled") === "true";

        // Custom Background Image Base64
        let customBackgroundImageBase64 = localStorage.getItem("customBackgroundImage");


        // --- Core Functions ---

        function updateClock() {
            const now = new Date();
            const h = String(now.getHours()).padStart(2, '0');
            const m = String(now.getMinutes()).padStart(2, '0');
            const s = String(now.getSeconds()).padStart(2, '0');
            clockEl.textContent = `${h}:${m}:${s}`;

            let nextAlarmTime = null;
            let timeToNextAlarm = Infinity;
            let triggeredAlarm = null;

            document.body.classList.remove("shake-light", "shake-medium", "shake-strong");

            alarms.forEach(alarm => {
                const target = new Date();
                target.setHours(alarm.hour, alarm.minute, alarm.second, 0);

                let diff = target.getTime() - now.getTime();

                // If today's target is in the past, set it for tomorrow
                if (diff < -500) { // Si es más de 0.5 segundos en el pasado
                    target.setDate(target.getDate() + 1);
                    diff = target.getTime() - now.getTime();
                }

                // Check for immediate trigger (within the current second, allowing for minor timing delays)
                if (diff >= -500 && diff <= 500 && !alarm.triggeredThisSecond) { // Trigger if within +/- 0.5s of target
                    triggeredAlarm = alarm;
                    alarm.triggeredThisSecond = true; // Mark as triggered for this second
                } else if (diff > 500) { // Reset trigger flag if the time has passed and we're looking at the future again
                    alarm.triggeredThisSecond = false;
                }

                // Find the next upcoming alarm (only consider future alarms)
                if (diff > 0 && diff < timeToNextAlarm) {
                    timeToNextAlarm = diff;
                    nextAlarmTime = target;
                }
            });

            if (triggeredAlarm && !confettiActive) {
                confettiActive = true;
                showMessage();
                showBanner(triggeredAlarm.message || currentCustomBannerText);
                launchConfetti();
                launchFireworks();
                if (partyPopperEnabled && partyPopperImageBase64) {
                    launchPartyPoppers(partyPopperImageBase64);
                }
                document.body.classList.remove("shake-light", "shake-medium", "shake-strong"); // Quitar el shake cuando se activa
            } else if (!triggeredAlarm && confettiActive) {
                if (timeToNextAlarm > 1000) { // Si la siguiente alarma está a más de 1 segundo
                    confettiActive = false;
                }
            }


            if (nextAlarmTime) {
                updateCountdown(now, nextAlarmTime);
                const secondsUntilNextAlarm = Math.floor(timeToNextAlarm / 1000);

                // El shake se mantiene hasta que el segundo es 0
                if (secondsUntilNextAlarm <= 10 && secondsUntilNextAlarm > 6) document.body.classList.add("shake-light");
                else if (secondsUntilNextAlarm <= 6 && secondsUntilNextAlarm > 3) document.body.classList.add("shake-medium");
                else if (secondsUntilNextAlarm <= 3 && secondsUntilNextAlarm >= 0) document.body.classList.add("shake-strong"); // Shake fuerte hasta el segundo 0
                else document.body.classList.remove("shake-light", "shake-medium", "shake-strong");
            } else {
                countdownEl.textContent = "No hay horas mágicas programadas.";
                document.body.classList.remove("shake-light", "shake-medium", "shake-strong");
            }
        }

        function updateCountdown(now, targetTime) {
            let diff = targetTime - now;

            const hours = String(Math.floor(diff / 1000 / 60 / 60)).padStart(2, '0');
            const minutes = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, '0');
            const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
            countdownEl.textContent = `Faltan ${hours}:${minutes}:${seconds} para la próxima hora mágica`;
        }


        function showMessage() {
            messageEl.classList.add("show");
            setTimeout(() => {
                messageEl.classList.remove("show");
            }, 10000);
        }

        function showBanner(message) {
            bannerEl.textContent = `🚩 ${message} 🚩`;
            bannerEl.classList.add("show");
            setTimeout(() => bannerEl.classList.remove("show"), 10000);
        }

        function launchConfetti() {
            const duration = 10000;
            const animationEnd = Date.now() + duration;
            (function frame() {
                confetti({
                    particleCount: 5,
                    angle: Math.random() * 360,
                    spread: 90 + Math.random() * 90,
                    origin: { x: Math.random(), y: Math.random() }
                });
                if (Date.now() < animationEnd) requestAnimationFrame(frame);
            })();
        }

        function launchFireworks() {
            const canvas = document.getElementById("fireworksCanvas");
            const ctx = canvas.getContext("2d");
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            canvas.style.display = "block";

            const rockets = [];
            const particles = [];
            const duration = 10000;
            const endTime = Date.now() + duration;

            function createRocket() {
                rockets.push({
                    x: Math.random() * canvas.width,
                    y: canvas.height,
                    vx: (Math.random() - 0.5) * 2,
                    vy: -7 - Math.random() * 3,
                    exploded: false
                });
            }

            function explode(x, y) {
                for (let i = 0; i < 25; i++) {
                    const angle = Math.random() * 2 * Math.PI;
                    const speed = Math.random() * 4 + 2;
                    particles.push({
                        x, y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        life: 100,
                        color: `hsl(${Math.random() * 360}, 100%, 70%)`
                    });
                }
            }

            function animate() {
                ctx.fillStyle = "rgba(0, 0, 0, 0)";
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                for (let i = rockets.length - 1; i >= 0; i--) {
                    const r = rockets[i];
                    r.x += r.vx;
                    r.y += r.vy;
                    r.vy += 0.1;
                    ctx.beginPath();
                    ctx.fillStyle = "white";
                    ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
                    ctx.fill();
                    if (!r.exploded && r.vy >= 0) {
                        explode(r.x, r.y);
                        r.exploded = true;
                    }
                    if (r.y > canvas.height || r.exploded) {
                        rockets.splice(i, 1);
                    }
                }

                for (let i = particles.length - 1; i >= 0; i--) {
                    const p = particles[i];
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += 0.05;
                    p.life--;
                    ctx.beginPath();
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = Math.max(p.life / 100, 0);
                    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                    ctx.fill();
                    if (p.life <= 0) {
                        particles.splice(i, 1);
                    }
                }

                ctx.globalAlpha = 1;
                if (Date.now() < endTime && Math.random() < 0.05) {
                    createRocket();
                }

                if (Date.now() < endTime || particles.length > 0 || rockets.length > 0) {
                    requestAnimationFrame(animate);
                } else {
                    canvas.style.display = "none";
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
            }

            createRocket();
            animate();
        }

        // --- Panel Toggling Functions ---

        function toggleSettings() {
            calendarPanel.style.display = "none";
            alarmsPanel.style.display = "none";
            settingsPanel.style.display = settingsPanel.style.display === "flex" ? "none" : "flex";
            if (settingsPanel.style.display === "flex") {
                commandInput.value = currentCustomBannerText;
                updateCurrentTimeText();
                partyPopperToggle.checked = partyPopperEnabled;
            }
        }

        function toggleCalendar() {
            settingsPanel.style.display = "none";
            alarmsPanel.style.display = "none";
            calendarPanel.style.display = calendarPanel.style.display === "flex" ? "none" : "flex";
            if (calendarPanel.style.display === "flex") {
                renderCalendar(currentMonth, currentYear);
            }
        }

        function toggleAlarms() {
            settingsPanel.style.display = "none";
            calendarPanel.style.display = "none";
            alarmsPanel.style.display = alarmsPanel.style.display === "flex" ? "none" : "flex";
            if (alarmsPanel.style.display === "flex") {
                renderAlarms();
            }
        }

        // --- Settings Functions ---

        function saveCustomBannerText() {
            const input = commandInput.value.trim();
            if (input) {
                currentCustomBannerText = input;
                localStorage.setItem("bannerText", currentCustomBannerText);
                alert("Mensaje por defecto para la Hora Mágica guardado.");
            }
            toggleSettings();
        }

        function updateCurrentTimeText() {
            document.getElementById("currentTimeText").textContent = `🛠️ Ajustes de la aplicación`;
        }

        function toggleRGBBackground() {
            const enabled = bgToggle.checked;
            document.body.classList.toggle("animated-bg", enabled);
            localStorage.setItem("animatedBG", enabled);

            if (enabled) {
                 // Si el fondo animado está activado, la imagen de fondo explícita se quita
                 document.body.style.backgroundImage = '';
            } else if (customBackgroundImageBase64) {
                 document.body.style.backgroundImage = `url('${customBackgroundImageBase64}')`;
            } else {
                // Si ninguna está activada, se asegura que la imagen de fondo esté vacía
                // para que el linear-gradient del CSS por defecto del body se aplique.
                document.body.style.backgroundImage = '';
            }
        }

        function loadBackgroundSetting() {
            const savedAnimated = localStorage.getItem("animatedBG");
            customBackgroundImageBase64 = localStorage.getItem("customBackgroundImage");

            if (savedAnimated === "true") {
                document.body.classList.add("animated-bg");
                bgToggle.checked = true;
                document.body.style.backgroundImage = ''; // Asegura que no haya imagen custom cuando RGB está activo
            } else if (customBackgroundImageBase64) {
                document.body.style.backgroundImage = `url('${customBackgroundImageBase64}')`;
                bgToggle.checked = false; // Asegura que el checkbox RGB esté desactivado si hay imagen custom
            } else {
                document.body.style.backgroundImage = ''; // Asegura que el linear-gradient por defecto del CSS esté visible
                document.body.classList.remove("animated-bg"); // Asegura que la clase animated-bg esté removida
                bgToggle.checked = false;
            }
        }

        function uploadCustomBackground(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    customBackgroundImageBase64 = e.target.result;
                    localStorage.setItem("customBackgroundImage", customBackgroundImageBase64);
                    bgToggle.checked = false;
                    document.body.classList.remove("animated-bg");
                    localStorage.setItem("animatedBG", false);

                    document.body.style.backgroundImage = `url('${customBackgroundImageBase64}')`;
                    alert("Imagen de fondo personalizada guardada.");
                };
                reader.readAsDataURL(file);
            }
            event.target.value = '';
        }

        function clearCustomBackground() {
            localStorage.removeItem("customBackgroundImage");
            customBackgroundImageBase64 = null;
            alert("Imagen de fondo personalizada eliminada.");

            const savedAnimated = localStorage.getItem("animatedBG");
            if (savedAnimated === "true") {
                document.body.classList.add("animated-bg");
                document.body.style.backgroundImage = ''; // Limpiar imagen explícita si RGB está activo
            } else {
                document.body.style.backgroundImage = ''; // Esto hará que el linear-gradient por defecto del CSS sea visible
            }
            bgToggle.checked = (savedAnimated === "true"); // Sincroniza el estado del checkbox
        }


        // --- Party Poppers Functions ---

        function savePartyPopperSetting() {
            partyPopperEnabled = partyPopperToggle.checked;
            localStorage.setItem("partyPopperEnabled", partyPopperEnabled);
        }

        function uploadPartyPopperImage(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    partyPopperImageBase64 = e.target.result;
                    localStorage.setItem("partyPopperImage", partyPopperImageBase64);
                    alert("Imagen para animación de fiesta guardada.");
                };
                reader.readAsDataURL(file);
            }
            event.target.value = '';
        }

        function launchPartyPoppers(imageUrl) {
            const popperCount = 50; // Más poppers
            const duration = 10000;
            const container = document.body;
            
            for (let i = 0; i < popperCount; i++) {
                const img = document.createElement('img');
                img.src = imageUrl;
                img.classList.add('party-popper-image');

                // Posiciona la imagen inicialmente en el centro, con un poco de aleatoriedad
                img.style.left = `calc(50% + ${Math.random() * 400 - 200}px)`; // Dispersion horizontal en el centro
                img.style.bottom = `0px`; // Empieza desde la parte inferior

                img.style.animationDelay = `${Math.random() * 0.5}s`;
                img.style.animationDuration = `${duration / 1000 + Math.random() * 2}s`;
                
                // Aplica una rotación inicial aleatoria
                img.style.transform = `translateX(-50%) rotate(${Math.random() * 360}deg)`; 
                
                container.appendChild(img);

                setTimeout(() => {
                    img.remove();
                }, duration + 2000);
            }
        }


        // --- Calendar Rendering Functions ---

        function renderCalendar(month, year) {
            const firstDayOfMonth = new Date(year, month, 1);
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const today = new Date();
            const currentDayOfMonth = today.getDate();
            const currentMonthOfYear = today.getMonth();
            const currentYearFull = today.getFullYear();

            let startDayOfWeek = firstDayOfMonth.getDay();
            startDayOfWeek = (startDayOfWeek === 0) ? 6 : startDayOfWeek - 1;

            monthYearEl.textContent = `${monthNames[month]} ${year}`;
            calendarDaysEl.innerHTML = '';

            const prevMonthLastDay = new Date(year, month, 0).getDate();
            for (let i = startDayOfWeek; i > 0; i--) {
                const dayEl = document.createElement('div');
                dayEl.classList.add('calendar-day', 'other-month');
                dayEl.textContent = prevMonthLastDay - i + 1;
                calendarDaysEl.appendChild(dayEl);
            }

            for (let i = 1; i <= daysInMonth; i++) {
                const dayEl = document.createElement('div');
                dayEl.classList.add('calendar-day');
                dayEl.textContent = i;

                if (year === currentYearFull && month === currentMonthOfYear && i === currentDayOfMonth) {
                    dayEl.classList.add('current-day');
                }
                calendarDaysEl.appendChild(dayEl);
            }

            const totalDaysDisplayed = startDayOfWeek + daysInMonth;
            let cellsToFill = 42 - totalDaysDisplayed;
            if (cellsToFill < 0) cellsToFill = cellsToFill % 7 + 7;

            for (let i = 1; i <= cellsToFill; i++) {
                const dayEl = document.createElement('div');
                dayEl.classList.add('calendar-day', 'other-month');
                dayEl.textContent = i;
                calendarDaysEl.appendChild(dayEl);
            }
        }

        function prevMonth() {
            currentYear = (currentMonth === 0) ? currentYear - 1 : currentYear;
            currentMonth = (currentMonth === 0) ? 11 : currentMonth - 1;
            renderCalendar(currentMonth, currentYear);
        }

        function nextMonth() {
            currentYear = (currentMonth === 11) ? currentYear + 1 : currentYear;
            currentMonth = (currentMonth === 11) ? 0 : currentMonth + 1;
            renderCalendar(currentMonth, currentYear);
        }

        // --- Alarms Management Functions ---

        function addAlarm() {
            const name = document.getElementById("newAlarmName").value.trim();
            const hour = parseInt(document.getElementById("newAlarmHour").value);
            const minute = parseInt(document.getElementById("newAlarmMinute").value);
            const second = parseInt(document.getElementById("newAlarmSecond").value);
            const message = document.getElementById("newAlarmMessage").value.trim();

            if (!name || isNaN(hour) || isNaN(minute) || isNaN(second)) {
                alert("Por favor, rellena los campos 'Nombre', 'Hora', 'Minuto' y 'Segundo' de la Hora Mágica.");
                return;
            }

            if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) {
                alert("La hora, minuto o segundo no son válidos.");
                return;
            }

            const newAlarm = {
                id: Date.now(),
                name,
                hour,
                minute,
                second,
                message: message || currentCustomBannerText,
                triggeredThisSecond: false
            };

            alarms.push(newAlarm);
            saveAlarms();
            renderAlarms();
            document.getElementById("newAlarmName").value = '';
            document.getElementById("newAlarmHour").value = '17';
            document.getElementById("newAlarmMinute").value = '30';
            document.getElementById("newAlarmSecond").value = '00';
            document.getElementById("newAlarmMessage").value = '';
        }

        function saveAlarms() {
            localStorage.setItem("alarms", JSON.stringify(alarms));
        }

        function renderAlarms() {
            alarmsListEl.innerHTML = '';

            if (alarms.length === 0) {
                alarmsListEl.innerHTML = '<p style="text-align: center; color: #888;">No hay horas mágicas guardadas.</p>';
                return;
            }

            const sortedAlarms = [...alarms].sort((a, b) => {
                if (a.hour !== b.hour) return a.hour - b.hour;
                if (a.minute !== b.minute) return a.minute - b.minute;
                return a.second - b.second;
            });


            sortedAlarms.forEach(alarm => {
                const alarmDiv = document.createElement('div');
                alarmDiv.classList.add('alarm-entry');
                alarmDiv.dataset.id = alarm.id;

                const formattedTime = `${String(alarm.hour).padStart(2, '0')}:${String(alarm.minute).padStart(2, '0')}:${String(alarm.second).padStart(2, '0')}`;

                alarmDiv.innerHTML = `
                    <div>
                        <span class="alarm-name">${alarm.name}</span>
                        <span class="alarm-time">${formattedTime}</span>
                    </div>
                    <div>
                        <small style="color: #aaa;">Mensaje: ${alarm.message}</small>
                    </div>
                    <div class="alarm-actions">
                        <button onclick="editAlarm(${alarm.id})">Editar</button>
                        <button class="delete-btn" onclick="deleteAlarm(${alarm.id})">Eliminar</button>
                    </div>
                `;
                alarmsListEl.appendChild(alarmDiv);
            });
        }

        function editAlarm(id) {
            const alarmIndex = alarms.findIndex(a => a.id === id);
            if (alarmIndex > -1) {
                const alarm = alarms[alarmIndex];
                const newName = prompt("Editar nombre de la Hora Mágica:", alarm.name);
                if (newName === null) return;

                const newTime = prompt(`Editar hora de la Hora Mágica (HH:MM:SS), actual: ${String(alarm.hour).padStart(2, '0')}:${String(alarm.minute).padStart(2, '0')}:${String(alarm.second).padStart(2, '0')}`);
                if (newTime === null) return;

                const newMsg = prompt("Editar mensaje de la Hora Mágica:", alarm.message);
                if (newMsg === null) return;

                const timeParts = newTime.split(':').map(Number);
                if (timeParts.length === 3 && !isNaN(timeParts[0]) && !isNaN(timeParts[1]) && !isNaN(timeParts[2]) &&
                    timeParts[0] >= 0 && timeParts[0] <= 23 &&
                    timeParts[1] >= 0 && timeParts[1] <= 59 &&
                    timeParts[2] >= 0 && timeParts[2] <= 59)
                {
                    alarms[alarmIndex].name = newName.trim() || alarm.name;
                    alarms[alarmIndex].hour = timeParts[0];
                    alarms[alarmIndex].minute = timeParts[1];
                    alarms[alarmIndex].second = timeParts[2];
                    alarms[alarmIndex].message = newMsg.trim() || currentCustomBannerText;
                    saveAlarms();
                    renderAlarms();
                } else {
                    alert("Formato de hora inválido. Usa HH:MM:SS (ej: 17:30:00)");
                }
            }
        }

        function deleteAlarm(id) {
            if (confirm("¿Estás seguro de que quieres eliminar esta Hora Mágica?")) {
                const alarmIndex = alarms.findIndex(alarm => alarm.id === id);
                if (alarmIndex > -1) {
                    // Evitar eliminar la alarma predeterminada si su nombre y hora coinciden
                    const defaultAlarm = { name: "Hora de irse", hour: 13, minute: 39, second: 40 };
                    const isDefaultAlarm = (
                        alarms[alarmIndex].name === defaultAlarm.name &&
                        alarms[alarmIndex].hour === defaultAlarm.hour &&
                        alarms[alarmIndex].minute === defaultAlarm.minute &&
                        alarms[alarmIndex].second === defaultAlarm.second
                    );

                    if (isDefaultAlarm) {
                        alert("La alarma 'Hora de irse' es predeterminada y no puede ser eliminada.");
                    } else {
                        alarms = alarms.filter(alarm => alarm.id !== id);
                        saveAlarms();
                        renderAlarms();
                    }
                }
            }
        }

        // --- Initial Load ---
        // Se ejecuta cuando el DOM está completamente cargado
        document.addEventListener('DOMContentLoaded', (event) => {
            loadBackgroundSetting();
            partyPopperToggle.checked = partyPopperEnabled;
            commandInput.value = currentCustomBannerText;
            renderAlarms();
            setInterval(updateClock, 1000);
            updateClock();
        });