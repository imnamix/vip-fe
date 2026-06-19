export interface Slide { id: number; image: string; title: string; description: string }
export interface ServiceItem { id: number; image: string; title: string; description: string; icon: string }
export interface FaqItem { id: number; question: string; answer: string }
export interface TestimonialItem { id: number; name: string; city: string; review: string; rating: number }

export interface BrandState {
  logo: string; favicon: string; companyName: string; tagline: string;
  phone: string; email: string; address: string; gst: string;
  metaTitle: string; metaDesc: string; ogImage: string; keywords: string;
}

export interface HomeAboutState { title: string; desc: string }
export interface AboutInfoState { title: string; intro: string }

export interface SeoPage { page: string; title: string; desc: string; keywords: string }
