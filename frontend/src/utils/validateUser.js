export default function validateUser(formData) {
  // Name should contain only letters
  const nameRegex = /^[A-Za-z]+$/;

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Mobile number must have exactly 10 digits
  const mobileRegex = /^[0-9]{10}$/;

  // NIC: Either 12 digits OR 9 digits ending with 'V' or 'X' (case-insensitive)
  const nicRegex = /^(?:\d{12}|\d{9}[VvXx])$/;

  // Validate First Name
  if (!nameRegex.test(formData.firstName)) {
    return "First name should only contain letters.";
  }

  // Validate Last Name
  if (!nameRegex.test(formData.lastName)) {
    return "Last name should only contain letters.";
  }

  // Validate Email
  if (!emailRegex.test(formData.email)) {
    return "Please enter a valid email address.";
  }

  // Validate Mobile Number
  if (!mobileRegex.test(formData.mobile)) {
    return "Mobile number must be exactly 10 digits.";
  }

  // Validate NIC (12 digits OR 9 digits + V/X)
  if (!nicRegex.test(formData.nic)) {
    return "NIC must be either 12 digits, or 9 digits ending with 'V' or 'X'.";
  }

  // Validate Password
  if (formData.password.length < 6) {
    return "Password must be at least 6 characters long.";
  }

  // All validations passed
  return null;
}