function getLocation(headerText) {
  const locationMatch = headerText.match(/([A-Z]会場|ポスター\dF)/);
  if (locationMatch) {
    return locationMatch[1];
  } else {
    return '';
  };
};


function createCalendarButton(calendarUrl) {
  const addButton = document.createElement('button');
  addButton.textContent = "カレンダーに追加";
  addButton.style.marginLeft = '1em';
  addButton.style.padding = '4px 8px';
  addButton.style.color = 'white';
  addButton.style.backgroundColor = '#4285f4';
  addButton.style.border = 'none';
  addButton.style.borderRadius = '4px';
  addButton.style.cursor = 'pointer';
  addButton.style.fontSize = '12px';

  addButton.addEventListener('click', () => {
    window.open(calendarUrl, '_blank');
  });

  return addButton;
};


function createCalendarLink({ title, dateTimeText, location, details='' }) {
  // dateTimeText = "3月11日（火） 8:30-10:00  A会場"
  const dateMatch = dateTimeText.match(/(\d{1,2})月(\d{1,2})日/);
  const year = 2025;
  let month, day;
  if (dateMatch) {
    month = parseInt(dateMatch[1], 10);
    day   = parseInt(dateMatch[2], 10);
  }

  // 時刻 "8:30-10:00" を取り出す
  const timeMatch = dateTimeText.match(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/);
  let startHour, startMinute, endHour, endMinute;
  if (timeMatch) {
    startHour   = parseInt(timeMatch[1], 10);
    startMinute = parseInt(timeMatch[2], 10);
    endHour     = parseInt(timeMatch[3], 10);
    endMinute   = parseInt(timeMatch[4], 10);
  }

  // Google Calendar の日時形式 "YYYYMMDDTHHMMSS" に変換
  function pad2(num) {
    return num.toString().padStart(2, '0');
  }
  const startDateTime = `${year}${pad2(month)}${pad2(day)}T${pad2(startHour)}${pad2(startMinute)}00`;
  const endDateTime   = `${year}${pad2(month)}${pad2(day)}T${pad2(endHour)}${pad2(endMinute)}00`;

  // Ref: https://developers.google.com/calendar/api/guides/create-events#from-your-application
  const baseUrl = "https://calendar.google.com/calendar/u/0/r/eventedit";
  const params = new URLSearchParams({
    text: title,
    dates: `${startDateTime}/${endDateTime}`,
    location: location || '',
    details: details || '',
  });
  const eventUrl = `${baseUrl}?${params.toString()}`;

  return eventUrl;
}


function addCalendarButtons() {
  // 発表ブロックを探す
  const sessionBlocks = document.querySelectorAll('.session1, .session2');
  sessionBlocks.forEach(block => {
    const content = block.querySelector('table > tbody')
    if (!content) return;

    const contentRows = content.rows;
    if (!contentRows) return;

    if (contentRows.length  == 2) { // チュートリアル・講演
      const headerElement = block.querySelector('.session_header');
      if (!headerElement) return;

      const headerText = headerElement.innerText.trim();
      const dateTimeText = headerText;

      const titleElement = block.querySelector('table > tbody > tr > td > span.title');
      const title = titleElement ? titleElement.innerText.trim() : '';

      const location = getLocation(headerText);

      const calendarUrl = createCalendarLink({
        title,
        dateTimeText,
        location,
        details: `${location}\n${title}`,
      });

      const addButton = createCalendarButton(calendarUrl);
      const sessionFooter = block.querySelector('.session_footer');
      sessionFooter.appendChild(addButton);

    } else { // 一般発表
      const headerElement = block.querySelector('.session_header');
      if (!headerElement) return;

      const headerText = headerElement.innerText.trim();
      const dateTimeText = headerText;
      const location = getLocation(headerText);

      const trs = block.querySelectorAll('table > tbody > tr');
      if (!trs) return;

      for (let i = 0; i+2 <= trs.length; i+=2 ) {

        const pid = trs[i].querySelector('td:nth-child(1)').innerText.trim();
        const title = trs[i].querySelector('td:nth-child(2) > span.title').innerText.trim();
        const author = trs[i+1].querySelector('td:nth-child(2)').innerText.trim();

        const calendarUrl = createCalendarLink({
          title: `${pid} ${title}`,
          dateTimeText,
          location,
          details: `${location}\n${pid} ${title}\n${author}`,
        });

        const addButton = createCalendarButton(calendarUrl);
        trs[i].appendChild(addButton);
      }

    }
  });
}


addCalendarButtons();
