export type User = {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  user_type: "student" | "guest";
  student_id: string | null;
  phone: string | null;
};

export type Comment = {
  id: number;
  username: string;
  body: string;
  parent: number | null;
  created_at: string;
  replies: Comment[];
};

export type Project = {
  id: number;
  title_th: string;
  title_en: string | null;
  department: string;
  department_name: string;
  academic_year: number;
  research_type: string;
  research_type_name: string;
  student_name: string;
  researcher_co1: string | null;
  researcher_co2: string | null;
  organization: string;
  funding_by: string | null;
  awards: string | null;
  abstract: string;
  keywords: string;
  background: string;
  objectives: string;
  scope: string;
  theory: string;
  methodology: string;
  results: string;
  discussion: string;
  suggestions_use: string;
  suggestions_next: string;
  other_info: string | null;
  pdf_url: string | null;
  uploaded_by: number | null;
  uploaded_by_name: string | null;
  is_approved: boolean;
  views_count: number;
  download_count: number;
  average_rating: number;
  total_ratings: number;
  is_favorited: boolean;
  user_rating: number;
  comments: Comment[];
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type ProjectOptions = {
  departments: { value: string; label: string }[];
  research_types: { value: string; label: string }[];
  academic_years: number[];
};

export type Stats = {
  total_projects: number;
  total_views: number;
  total_downloads: number;
  department_counts: {
    department: string;
    department_name: string;
    count: number;
  }[];
  top_viewed: Project[];
  top_downloaded: Project[];
  top_rated: Project[];
};
