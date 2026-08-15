const supabase = require("../config/supabase");

const getAllProducts = async () => {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
            id,
            name,
            category,
            is_available,
            created_at,
            product_variants (
                id,
                variant_label,
                price,
                created_at
            )
        `
    )
    .order("id", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const getProductById = async (productId) => {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
            id,
            name,
            category,
            is_available,
            created_at,
            product_variants (
                id,
                variant_label,
                price,
                created_at
            )
        `
    )
    .eq("id", productId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

module.exports = {
  getAllProducts,
  getProductById,
};
