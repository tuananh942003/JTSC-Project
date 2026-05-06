import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'JTSC';
const SITE_URL = 'https://jtsc.vn';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedAt?: string;
  modifiedAt?: string;
  structuredData?: object;
  noIndex?: boolean;
}

export default function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  publishedAt,
  modifiedAt,
  structuredData,
  noIndex = false,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} – Giải pháp Công nghệ Thông minh tại Việt Nam`;
  const metaDesc = description || 'JTSC cung cấp các giải pháp công nghệ thông tin hàng đầu: phần mềm doanh nghiệp, ứng dụng web & mobile, AI và tư vấn chuyển đổi số.';
  const metaImage = image || DEFAULT_IMAGE;
  const metaUrl = url ? `${SITE_URL}${url}` : SITE_URL;

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDesc} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <link rel="canonical" href={metaUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="vi_VN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={metaUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image" content={metaImage} />

      {/* Article specific */}
      {type === 'article' && publishedAt && (
        <meta property="article:published_time" content={publishedAt} />
      )}
      {type === 'article' && modifiedAt && (
        <meta property="article:modified_time" content={modifiedAt} />
      )}
      {type === 'article' && (
        <meta property="article:publisher" content={SITE_URL} />
      )}

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
