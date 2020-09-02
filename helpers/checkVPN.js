const axios = require("axios").default;

/*
type TeohResponse = {
  "ip": string,
  "organization": string,
  "asn": string,
  "type": "isp" | "mobile" | "Hosting/Datacenter" | "business" | "mixed",
  "risk":  "low" | "normal" | "high",
  "is_hosting": "0" | "1" | "2",
  "vpn_or_proxy": "yes" | "no" | "maybe",
};
*/

module.exports = async function teohCheckIP(ip) { 

  let teohCheck = await axios.get(`https://ip.teoh.io/api/vpn/${ip}`);
  let data = teohCheck.data;
  if (data.ip !== ip) return null;
  if (data.vpn_or_proxy === "yes" || data.is_hosting === "1" || data.type === "Hosting/Datacenter") return true;
  if (data.vpn_or_proxy === "maybe" && data.risk === "high") return true;
  if (data.is_hosting === "2" && data.risk === "high") return true;
  
  return false;

}