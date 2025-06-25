import { z } from "zod";

const registerSchema = z
  .object({
    name: z.string().nonempty("Vui lòng nhập họ tên"),
    email: z
      .string()
      .nonempty("Vui lòng nhập email")
      .email("Email không hợp lệ"),
    username: z
      .string()
      .nonempty("Vui lòng nhập tên đăng nhập")
      .min(4, "Tên đăng nhập phải có ít nhất 4 ký tự"),
    password: z
      .string()
      .nonempty("Vui lòng nhập mật khẩu")
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().nonempty("Vui lòng nhập lại mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu nhập lại không khớp",
  });

export default registerSchema;
