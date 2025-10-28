import { useState, useEffect } from 'react';
import { getImagenByNombre } from '@/api/imagenes';
import { Wallet as WalletIcon } from 'lucide-react';

interface WalletImageProps {
  walletName: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallbackIcon?: React.ReactNode;
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-20 h-20',
  lg: 'w-28 h-28',
  xl: 'w-32 h-32',
};

const imageSizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-28 h-28',
};

export const WalletImage: React.FC<WalletImageProps> = ({ 
  walletName, 
  className = '', 
  size = 'md',
  fallbackIcon 
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        setLoading(true);
        const response = await getImagenByNombre(walletName);
        const url = response.data.data.url;
        const fullUrl = url.startsWith('http') ? url : `http://localhost:3000${url}`;
        setImageUrl(fullUrl);
      } catch (error) {
        console.log(`No se encontró imagen para ${walletName}`);
        setImageUrl(null);
      } finally {
        setLoading(false);
      }
    };

    if (walletName) {
      fetchImage();
    }
  }, [walletName]);

  if (loading) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-white flex items-center justify-center shadow-md ${className}`}>
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-white flex items-center justify-center shadow-md ${className}`}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={walletName}
          className={`${imageSizeClasses[size]} object-contain p-1`}
          onError={() => setImageUrl(null)}
        />
      ) : (
        fallbackIcon || <WalletIcon className="w-8 h-8 text-primary" />
      )}
    </div>
  );
};
