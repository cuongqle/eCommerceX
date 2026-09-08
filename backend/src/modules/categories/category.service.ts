import { Types } from "mongoose";
import { Category } from "../../models/Category";
import { ApiError } from "../../utils/ApiError";
import { slugify } from "../../utils/slug";

interface CategoryInput {
  name: string;
  slug?: string;
  description?: string;
  parent?: string | null;
  isActive?: boolean;
}

async function assertParent(parentId?: string | null, currentId?: string) {
  if (!parentId) return null;
  if (!Types.ObjectId.isValid(parentId)) {
    throw ApiError.badRequest("Invalid parent category");
  }
  if (currentId && parentId === currentId) {
    throw ApiError.badRequest("A category cannot be its own parent");
  }

  const parent = await Category.findById(parentId);
  if (!parent) {
    throw ApiError.notFound("Parent category not found");
  }
  if (parent.parent) {
    throw ApiError.badRequest("Only two category levels are supported");
  }
  return parent._id;
}

export async function listPublicCategories() {
  return Category.find({ isActive: true }).sort({ name: 1 });
}

export async function listAdminCategories() {
  return Category.find().populate("parent", "name slug").sort({ createdAt: -1 });
}

export async function createCategory(input: CategoryInput) {
  const slug = input.slug ? slugify(input.slug) : slugify(input.name);
  const exists = await Category.findOne({ slug });
  if (exists) {
    throw ApiError.conflict("Category slug already exists");
  }

  const parent = await assertParent(input.parent);
  return Category.create({ ...input, slug, parent });
}

export async function updateCategory(id: string, input: Partial<CategoryInput>) {
  const category = await Category.findById(id);
  if (!category) {
    throw ApiError.notFound("Category not found");
  }

  if (input.name) category.name = input.name;
  if (input.description !== undefined) category.description = input.description;
  if (input.isActive !== undefined) category.isActive = input.isActive;
  if (input.parent !== undefined) {
    category.parent = await assertParent(input.parent, id);
  }
  if (input.slug || input.name) {
    category.slug = slugify(input.slug ?? input.name ?? category.name);
  }

  await category.save();
  return category;
}

export async function deleteCategory(id: string) {
  const childCount = await Category.countDocuments({ parent: id });
  if (childCount > 0) {
    throw ApiError.badRequest("Move or delete subcategories first");
  }

  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    throw ApiError.notFound("Category not found");
  }
  return category;
}
