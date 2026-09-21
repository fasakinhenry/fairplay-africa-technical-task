export interface AuthResponseBody {
  user: { id: string; name: string; email: string };
  token: string;
}

export interface ContentResponseBody {
  content: {
    id: string;
    title: string;
    description: string | null;
    type: string;
    url: string | null;
    ownerId: string;
  };
}

export interface ContentListResponseBody {
  items: ContentResponseBody["content"][];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}
