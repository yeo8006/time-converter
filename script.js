const WIN_UNIX_EPOCH_GAP_MILLISECOND = 11_644_473_600_000
const HUNDRED_NANO_PER_MILLI = 10000
const MILLI_PER_ONE = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;


document.addEventListener('DOMContentLoaded', function () {
    // 초기 시간 표시 및 1초마다 업데이트
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    initDatetime();
    convertDatetimeToOthers();
    convertFileTimeToOthers();
    convertUnixToOthers();

    // 타임존 변경 시 업데이트
    document.getElementById('timezone').addEventListener('change', function () {
        updateZoneTime();
    });

    // 입력 필드에 이벤트 리스너 추가
    document.getElementById('input-datetime').addEventListener('change', function () {
        convertDatetimeToOthers();
    });
    document.getElementById('input-filetime').addEventListener('input', function () {
        convertFileTimeToOthers();
    });
    document.getElementById('input-unixtime').addEventListener('input', function () {
        convertUnixToOthers();
    });
});

function showLocalTime(now) {
  const options = {
    weekday: 'long',       // 요일: "목요일"
    year: 'numeric',       // 연도: "2025년"
    month: 'long',         // 월: "4월"
    day: 'numeric',        // 일: "10일"?
    hour: 'numeric',       // 시: "10시"?
    minute: 'numeric',     // 분: "3분"
    second: 'numeric',     // 초: "6초"
    hour12: false,         // 24시간 형식
    timeZoneName: 'long'   // 시간대 이름: "한국 표준시"
  };
  let dateTime = now.toLocaleString(undefined, options);
  const offsetMinutes = now.getTimezoneOffset();
  const offsetHourPart = String(Math.floor(Math.abs(offsetMinutes) / MINUTES_PER_HOUR)).padStart(2, '0');
  const offsetMinutePart = String(Math.abs(offsetMinutes) % MINUTES_PER_HOUR).padStart(2, '0');
  const sign = offsetMinutes <= 0 ? '+' : '-';
  const offsetString = `UTC${sign}${offsetHourPart}:${offsetMinutePart}`;
  dateTime += ` (${offsetString})`

  document.getElementById('current-datetime').textContent = dateTime;
}

function showZoneTime(now) {
  const offsetHours = parseInt(document.getElementById('timezone').value);
  const zoneNow = new Date(now.getTime() + offsetHours * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MILLI_PER_ONE);
  let zoneTime = zoneNow.toISOString();
  zoneTime = zoneTime.slice(0, -1); // Z 제거
  
  const sign = offsetHours >= 0 ? '+' : '-';
  const absOffset = Math.abs(offsetHours);
  const hours = Math.floor(absOffset);
  const minutes = 0; // timezone에 분 단위의 선택지는 없는 상태
  offsetString = `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  zoneTime += offsetString;
  
  document.getElementById('current-zonetime').textContent = zoneTime;
}

function updateCurrentTime() {
    // Date objects encapsulate an integral number that represents milliseconds 
    // since the midnight at the beginning of January 1, 1970, UTC (the epoch).
    // Range from April 20, 271821 BC to September 13, 275760 AD.
    // Range ±8.64e15 ms
    // Range ±100,000,000 days
    // Outside this range results in value of NaN
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
    const now = new Date();

    showLocalTime(now);

    showZoneTime(now);
    
    // showUTCTime()
    const utcTime = now.toISOString();
    document.getElementById('current-utctime').textContent = utcTime;

    // showFileTime()
    const fileTime = (now.getTime() + WIN_UNIX_EPOCH_GAP_MILLISECOND) * HUNDRED_NANO_PER_MILLI;
    document.getElementById('current-filetime').textContent = fileTime;

    // showUNIXTime()
    const unixTime = Math.floor(now.getTime() / MILLI_PER_ONE);
    document.getElementById('current-unixtime').textContent = unixTime;
}

function updateZoneTime() {
  const now = new Date();
  showZoneTime(now);
}

function initDatetime() {
    const datetimeInput = document.getElementById('input-datetime');
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    const currentDatetime = `${year}-${month}-${day}T${hours}:${minutes}`;
    datetimeInput.value = currentDatetime;
}

// 날짜/시간 값을 다른 시간으로 변환
function convertDatetimeToOthers() {
    const datetime = document.getElementById('input-datetime');
    if (!datetime || !datetime.value) {
        console.log("[convertDatetimeToOthers] invalid input-datetime");
        return;
    }
    
    const date = new Date(datetime.value);
    if (isNaN(date.getTime())) {
        console.log("Invalid date");
        return;
    }

    const utcTime = date.toISOString();
    const fileTime = (date.getTime() + WIN_UNIX_EPOCH_GAP_MILLISECOND) * HUNDRED_NANO_PER_MILLI;
    const unixTime = Math.floor(date.getTime() / MILLI_PER_ONE);

    document.querySelector('.datetime-to-utctime').textContent = utcTime;
    document.querySelector('.datetime-to-filetime').textContent = fileTime;
    document.querySelector('.datetime-to-unixtime').textContent = unixTime;
}

function convertFileTimeToOthers() {
    const fileTime = document.getElementById('input-filetime');
    if (!fileTime) {
        console.log("[convertFileTimeToOthers] invalid input-filetime")
        return;
    }
    
    const ms = fileTime.value / HUNDRED_NANO_PER_MILLI - WIN_UNIX_EPOCH_GAP_MILLISECOND;
    const date = new Date(ms);
    
    const utcTime = date.toISOString();
    const unixTime = Math.floor(date.getTime() / MILLI_PER_ONE);

    document.querySelector('.filetime-to-utctime').textContent = utcTime;
    document.querySelector('.filetime-to-unixtime').textContent = unixTime;
}

function convertUnixToOthers() {
    const unixTime = document.getElementById('input-unixtime');
    if (!unixTime) {
        console.log("[convertUnixToOthers] invalid input-unixtime")
        return;
    }

    const date = new Date(unixTime.value * MILLI_PER_ONE);
    const utcTime = date.toISOString();
    const fileTime = (date.getTime() + WIN_UNIX_EPOCH_GAP_MILLISECOND) * HUNDRED_NANO_PER_MILLI;
    document.querySelector('.unixtime-to-utctime').textContent = utcTime;
    document.querySelector('.unixtime-to-filetime').textContent = fileTime;
}
