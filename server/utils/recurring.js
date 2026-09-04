// Period key identifies "has this template already fired in the current cycle".
function getPeriodKey(frequency, now) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  switch (frequency) {
    case "daily":
      return `${y}-${m}-${d}`;
    case "weekly": {
      const oneJan = new Date(y, 0, 1);
      const dayOfYear = Math.floor((now - oneJan) / 86400000) + 1;
      const week = Math.ceil((dayOfYear + oneJan.getDay()) / 7);
      return `${y}-W${week}`;
    }
    case "yearly":
      return `${y}`;
    case "monthly":
    default:
      return `${y}-${m}`;
  }
}

// Due date for the generated instance, anchored to the template's original date where it makes sense.
function getDueDate(frequency, templateDate, now) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const templateDay = Math.min(new Date(templateDate).getDate(), 28);
  switch (frequency) {
    case "daily":
    case "weekly":
      return `${y}-${m}-${d}`;
    case "yearly": {
      const templateMonth = String(new Date(templateDate).getMonth() + 1).padStart(2, "0");
      return `${y}-${templateMonth}-${String(templateDay).padStart(2, "0")}`;
    }
    case "monthly":
    default:
      return `${y}-${m}-${String(templateDay).padStart(2, "0")}`;
  }
}

// Advances a date by one unit of the given frequency.
function addPeriod(date, frequency) {
  const d = new Date(date);
  switch (frequency) {
    case "daily":
      d.setDate(d.getDate() + 1);
      break;
    case "weekly":
      d.setDate(d.getDate() + 7);
      break;
    case "yearly":
      d.setFullYear(d.getFullYear() + 1);
      break;
    case "monthly":
    default:
      d.setMonth(d.getMonth() + 1);
      break;
  }
  return d;
}

module.exports = { getPeriodKey, getDueDate, addPeriod };
