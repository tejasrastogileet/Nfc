import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/utils/formatPrice';

export default function ProductCard({ product }) {
  return (
    <div className="h-full">
      <Link href={`/products/${product._id}`}>
        <div className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col border border-gray-100">
          {/* Product Image */}
          <div className="relative h-56 w-full bg-gray-100 overflow-hidden group">
            <Image
              src={product.image || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
            {product.stock <= 0 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">Out of Stock</span>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="p-5 flex-1 flex flex-col">
            {/* Name */}
            <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2">
              {product.name}
            </h3>

            {/* Price */}
            <div className="mb-4">
              <span className="text-2xl font-bold text-blue-600">
                {formatPrice(product.price)}
              </span>
            </div>

            {/* Stock Status */}
            <div className="mb-4">
              {product.stock > 0 ? (
                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  In Stock ({product.stock})
                </span>
              ) : (
                <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Description - grows to fill space */}
            <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">
              {product.description}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}

