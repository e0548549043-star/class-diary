// הצפנת סיסמאות עם bcrypt (סיסמאות לעולם לא נשמרות כטקסט רגיל)
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export const hashPassword = (password: string) => bcrypt.hash(password, SALT_ROUNDS);

export const hashPasswordSync = (password: string) => bcrypt.hashSync(password, SALT_ROUNDS);

export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);
