import { User, type UserRole } from "../../models/User";
import { ApiError } from "../../utils/ApiError";
import { paginated, parsePagination } from "../../utils/pagination";

interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  isActive?: boolean;
}

export async function listUsers(query: { page?: unknown; limit?: unknown; role?: unknown; q?: unknown }) {
  const { page, limit, skip } = parsePagination(query);
  const filter: Record<string, unknown> = {};

  if (typeof query.role === "string" && query.role) {
    filter.role = query.role;
  }
  if (typeof query.q === "string" && query.q.trim()) {
    filter.$or = [
      { name: new RegExp(query.q.trim(), "i") },
      { email: new RegExp(query.q.trim(), "i") },
    ];
  }

  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return paginated(items, total, page, limit);
}

export async function createUser(input: CreateUserInput) {
  const exists = await User.findOne({ email: input.email.toLowerCase() });
  if (exists) {
    throw ApiError.conflict("Email is already registered");
  }
  return User.create(input);
}

export async function updateUser(
  id: string,
  input: Partial<Pick<CreateUserInput, "name" | "email" | "role" | "isActive">>
) {
  const user = await User.findById(id);
  if (!user) {
    throw ApiError.notFound("User not found");
  }

  if (input.email && input.email.toLowerCase() !== user.email) {
    const exists = await User.findOne({ email: input.email.toLowerCase() });
    if (exists) {
      throw ApiError.conflict("Email is already registered");
    }
    user.email = input.email;
  }

  if (input.name) user.name = input.name;
  if (input.role) user.role = input.role;
  if (input.isActive !== undefined) user.isActive = input.isActive;

  await user.save();
  return user;
}
