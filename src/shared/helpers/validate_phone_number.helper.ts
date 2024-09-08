export function isMTNNumber(phoneNumber: string): string | false {
  const mtnPrefixes = [
    "0703",
    "0706",
    "0803",
    "0806",
    "0810",
    "0813",
    "0814",
    "0816",
    "0903",
    "0906",
  ];

  const normalizedPhoneNumber = phoneNumber.replace(/\s+/g, "");

  const isMTN = mtnPrefixes.some((prefix) =>
    normalizedPhoneNumber.startsWith(prefix)
  );

  if (isMTN) {
    const internationalNumber = "+234" + normalizedPhoneNumber.slice(1);
    return internationalNumber;
  }
  return false;
}
