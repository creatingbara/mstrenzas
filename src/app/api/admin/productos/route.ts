import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { hasPermission } from "@/lib/auth/permissions";
import { createProduct, deleteProduct, getProducts, updateProduct } from "@/lib/local-db";
import { productCreateSchema, productUpdateSchema } from "@/lib/validations";

export const runtime = "nodejs";

function authorize(session: { role: "super_admin" | "admin" | "colaborador" } | null) {
  if (!session) return { ok: false, status: 401, error: "No autorizado." } as const;
  if (!hasPermission(session.role, "manage_products")) {
    return { ok: false, status: 403, error: "No tienes permiso para gestionar productos." } as const;
  }
  return { ok: true } as const;
}

export async function GET() {
  const auth = authorize(await getAdminSession());
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  return NextResponse.json({ items: await getProducts() });
}

export async function POST(request: Request) {
  const auth = authorize(await getAdminSession());
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const parsed = productCreateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Revisa los datos del producto." }, { status: 400 });
  }

  try {
    const item = await createProduct(parsed.data);
    return NextResponse.json({ item, message: "Producto creado correctamente." }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo crear el producto.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = authorize(await getAdminSession());
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const parsed = productUpdateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Revisa los datos del producto." }, { status: 400 });
  }

  const { id, ...patch } = parsed.data;

  try {
    const item = await updateProduct(id, patch);
    if (!item) return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
    return NextResponse.json({ item, message: "Producto actualizado correctamente." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar el producto.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = authorize(await getAdminSession());
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Falta el producto." }, { status: 400 });

  try {
    const ok = await deleteProduct(id);
    if (!ok) return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
    return NextResponse.json({ ok, message: "Producto eliminado correctamente." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo eliminar el producto.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
