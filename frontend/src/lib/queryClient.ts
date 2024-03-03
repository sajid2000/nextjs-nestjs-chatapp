import { QueryClient } from "@tanstack/react-query";

import axios from "@/lib/axios";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: ({ queryKey }) => {
        const uri = queryKey[0] as string;
        return axios.get(uri).then((res) => res.data);
      },
      refetchOnMount: true,
      staleTime: 8000,
    },
  },
});
