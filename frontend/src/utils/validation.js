export const patterns = {
  personName: /^[A-Za-z][A-Za-z '-]{1,49}$/,
  idNumber: /^[0-9]{13}$/,
  accountNumber: /^[0-9]{10}$/,
  beneficiaryAccount: /^[0-9]{8,20}$/,
  username: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,64}$/,
  otp: /^[0-9]{6}$/,
  employeeNumber: /^EMP[0-9]{3,6}$/i,
  amount: /^(?:0|[1-9][0-9]{0,8})(?:\.[0-9]{1,2})?$/,
};

export const sanitizers = {
  personName: (value) => value.replace(/[^A-Za-z '-]/g, "").slice(0, 50),
  digits: (value, maxLength) => value.replace(/\D/g, "").slice(0, maxLength),
  email: (value) =>
    value
      .replace(/\s/g, "") // remove spaces
      .toLowerCase() // normalize casing
      .slice(0, 254), // max email length per RFC
  search: (value) => value.replace(/[^A-Za-z0-9 _-]/g, "").slice(0, 100),
  employeeNumber: (value) =>
    value
      .replace(/[^A-Za-z0-9]/g, "")
      .toUpperCase()
      .slice(0, 9),
  amount: (value) => {
    const cleaned = value.replace(/[^0-9.]/g, "");
    const [whole = "", ...decimals] = cleaned.split(".");
    const decimal = decimals.join("").slice(0, 2);

    if (cleaned.includes(".")) {
      return `${whole.slice(0, 9)}.${decimal}`;
    }

    return whole.slice(0, 9);
  },
};

export const validateRegistration = (form) => {
  const errors = {};

  if (!patterns.personName.test(form.firstName.trim())) {
    errors.firstName = "Use 2-50 letters only.";
  }

  if (!patterns.personName.test(form.lastName.trim())) {
    errors.lastName = "Use 2-50 letters only.";
  }

  if (!patterns.idNumber.test(form.idNumber)) {
    errors.idNumber = "ID number must be exactly 13 digits.";
  }

  if (!patterns.accountNumber.test(form.accountNumber)) {
    errors.accountNumber = "Account number must be exactly 10 digits.";
  }

  if (!patterns.username.test(form.username)) {
    errors.username = "please enter a valid email address.";
  }

  if (!patterns.password.test(form.password)) {
    errors.password =
      "Use 8+ characters with uppercase, lowercase, number, and symbol.";
  }

  return errors;
};

export const validateCustomerLogin = ({
  username,
  accountNumber,
  password,
}) => {
  const errors = {};

  if (!patterns.username.test(username)) {
    errors.username = "Enter a valid email address.";
  }

  if (!patterns.accountNumber.test(accountNumber)) {
    errors.accountNumber = "Account number must be exactly 10 digits.";
  }

  if (!password) {
    errors.password = "Password is required.";
  }

  return errors;
};

export const validateOtp = (otp) => {
  if (!patterns.otp.test(otp)) {
    return { otp: "OTP must be exactly 6 digits." };
  }

  return {};
};

export const validateEmployeeLogin = ({ username, password }) => {
  const errors = {};

  if (!patterns.username.test(username)) {
    errors.username = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  }

  return errors;
};

export const validatePayment = (payment) => {
  const errors = {};
  const amountNumber = Number(payment.amount);

  if (!patterns.personName.test(payment.beneficiaryName.trim())) {
    errors.beneficiaryName = "Use 2-50 letters only.";
  }

  if (!patterns.beneficiaryAccount.test(payment.beneficiaryAccount)) {
    errors.beneficiaryAccount = "Use 8-20 digits only.";
  }

  if (!patterns.amount.test(payment.amount) || amountNumber <= 0) {
    errors.amount = "Enter a positive amount with up to 2 decimals.";
  } else if (amountNumber > 999999999.99) {
    errors.amount = "Amount is above the allowed limit.";
  }

  if (!["ZAR", "USD", "EUR", "GBP"].includes(payment.currency)) {
    errors.currency = "Select a supported currency.";
  }

  if (payment.provider !== "SWIFT") {
    errors.provider = "Only SWIFT payments are supported.";
  }

  if (!payment.swiftCode) {
    errors.swiftCode = "Please select a SWIFT code.";
  } else if (!/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(payment.swiftCode)) {
    errors.swiftCode = "Enter a valid SWIFT/BIC code.";
  }

  return errors;
};

export const hasErrors = (errors) => Object.keys(errors).length > 0;

export const getApiErrorMessage = (error, fallback) => {
  if (error?.response?.data?.errors) {
    const firstError = Object.values(error.response.data.errors).flat()[0];
    if (firstError) return firstError;
  }

  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.request) return "Unable to reach the server. Please try again.";

  return fallback;
};
