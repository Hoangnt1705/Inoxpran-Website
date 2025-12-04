// src/lib/seo/meta.js

export function buildCategorySeo({ category, baseUrl }) {
  const url = `${baseUrl}/danh-muc/${category.slug}`;

  return {
    title: `${category.name} | Inox Shop`,
    description:
      category.seoDescription ||
      (category.description
        ? category.description.slice(0, 150)
        : `Mua ${category.name} chính hãng, giá tốt, giao hàng nhanh.`),
    image: category.coverImage,
    url
  };
}

export function buildProductSeo({ product, baseUrl }) {
  const url = `${baseUrl}/san-pham/${product.slug}`;
  const image = product.images?.[0];

  return {
    title: `${product.name} | Inox Shop`,
    description:
      product.seoDescription ||
      (product.shortDescription
        ? product.shortDescription.slice(0, 160)
        : `Mua ${product.name} chính hãng, bảo hành rõ ràng, giao hàng toàn quốc.`),
    image,
    url
  };
}
