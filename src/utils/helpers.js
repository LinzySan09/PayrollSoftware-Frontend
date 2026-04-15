export const fmtAED = n => `AED ${Math.round(Math.abs(n||0)).toLocaleString()}`;
export const initials = (n="") => n.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
export const daysUntil = d => { if(!d) return 9999; return Math.ceil((new Date(d)-Date.now())/86400000); };
export const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
export const DEPTS  = ["Engineering","HR","Operations","Finance","Sales","Admin","Logistics","IT","Legal"];
