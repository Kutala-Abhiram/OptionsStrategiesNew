const generateQuote = (underlyingAsset, expiryDate, strikePrice, callOption=true) => {
  return `NSE:${underlyingAsset}${getExpiryString(expiryDate)}${strikePrice}${callOption ? 'CE' : 'PE'}`;
}

const getExpiryString = (expiryDate) => {
  const year = expiryDate.getYear() % 100;
  const monthday = getMonthDayString(expiryDate);
  return `${year}${monthday}`;
}

const getMonthDayString = (expiryDate) => {
  const day = expiryDate.getDate();
  const lastDay = new Date(expiryDate.getFullYear(), expiryDate.getMonth() + 1, 0).getDate();

  if((lastDay - day) > 6) {
    return `${getMonthString(expiryDate.getMonth())}${("0" + day).slice(-2)}`;
  } else {
    return `${getLastWeekMonth(expiryDate.getMonth())}`;
  }
}

const getMonthString = (month) => {
  switch(month) {
    case 9:
      return 'O';
    case 10:
      return 'N';
    case 11:
      return 'D';
    default:
      return `${month + 1}`;
  }
}

const getLastWeekMonth = (month) => {
  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
  ];
  return monthNames[month];
}

module.exports = { generateQuote };
