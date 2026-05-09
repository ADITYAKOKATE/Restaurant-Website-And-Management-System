import dotenv from 'dotenv';
dotenv.config();

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACE_ID = process.env.GOOGLE_PLACE_ID;

export interface IGoogleReview {
  author_name: string;
  rating: number;
  text: string;
  relative_time_description: string;
  profile_photo_url: string;
}

const MOCK_REVIEWS: IGoogleReview[] = [
  {
    author_name: "Rahul Deshmukh",
    rating: 5,
    text: "Best Misal Pav in town! The spices are perfectly balanced and the service is excellent.",
    relative_time_description: "a week ago",
    profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul"
  },
  {
    author_name: "Sneha Patil",
    rating: 5,
    text: "Authentic Maharashtrian taste. The Puran Poli was so soft and delicious. Highly recommended!",
    relative_time_description: "2 weeks ago",
    profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha"
  },
  {
    author_name: "Amit Shinde",
    rating: 4,
    text: "Great atmosphere and friendly staff. Sol Kadhi is a must try here.",
    relative_time_description: "1 month ago",
    profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit"
  },
  {
    author_name: "Priya Kulkarni",
    rating: 5,
    text: "The Vada Pav is exactly how it should be. Crispy and hot. Love this place!",
    relative_time_description: "3 days ago",
    profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya"
  }
];

export async function fetchGoogleReviews(): Promise<IGoogleReview[]> {
  if (!GOOGLE_API_KEY || !PLACE_ID) {
    console.warn("Google Places API Key or Place ID missing. Using mock reviews.");
    return MOCK_REVIEWS;
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=reviews&key=${GOOGLE_API_KEY}`;
    const response = await fetch(url);
    const data = (await response.json()) as any;
    
    if (data.result && data.result.reviews) {
      return data.result.reviews;
    }
    
    return MOCK_REVIEWS;
  } catch (error) {
    console.error("Error fetching Google reviews:", error);
    return MOCK_REVIEWS;
  }
}
