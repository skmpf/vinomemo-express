import * as Yup from "yup";

const email = Yup.string()
  .required("Email is required")
  .email("Email must be valid");
const password = Yup.string()
  .required("Password is required")
  .min(8, "Password must be at least 8 characters")
  .max(20, "Password can't be longer than 20 characters");

export const loginSchema = Yup.object().shape({
  email,
  password,
});

export const signupSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email,
  password,
});

export const updateUserSchema = Yup.object().shape({
  name: Yup.string().notRequired(),
  email: email.notRequired(),
  password: password.notRequired(),
});
