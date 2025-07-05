import { z } from "zod";

const loginSchema = z.object({
  email: z.string().nonempty("Vui lòng nhập email").email("Email không hợp lệ"),
  password: z
    .string()
    .nonempty("Vui lòng nhập mật khẩu")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export default loginSchema;
