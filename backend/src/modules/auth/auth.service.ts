import { User, type UserRole } from "../../models/User";
import { ApiError } from "../../utils/ApiError";
import { signToken } from "../../utils/token";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
  expectedRole?: UserRole;
}

export async function registerCustomer(input: RegisterInput) {
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) {
    throw ApiError.conflict("Email is already registered");
  }

  const user = await User.create({
    name: input.name,
    email: input.email,
    password: input.password,
    role: "customer",
  });

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  return { user, token };
}

export async function login(input: LoginInput) {
  const user = await User.findOne({ email: input.email.toLowerCase() }).select("+password");
  if (!user || !user.isActive) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const matches = await user.comparePassword(input.password);
  if (!matches) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  if (input.expectedRole && user.role !== input.expectedRole) {
    throw ApiError.forbidden("This account cannot access this portal");
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  return { user, token };
}

export async function getProfile(userId: string) {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound("User not found");
  }
  return user;
}
