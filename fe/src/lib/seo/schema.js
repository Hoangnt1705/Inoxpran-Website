// src/lib/seo/schema.js

export function buildProductSchema({ product, pageUrl }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images || [],
    description: product.shortDescription || product.description,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'Inox Shop'
    },
    offers: {
      '@type': 'Offer',
      url: pageUrl,
      priceCurrency: 'VND',
      price: product.price,
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock'
    }
  };

  if (product.rating && product.rating.count > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating.average,
      reviewCount: product.rating.count
    };
  }

  return schema;
}
