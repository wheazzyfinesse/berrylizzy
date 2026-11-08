import { User } from "@/constants/types";
import { baseApi } from "./api";

export const usersApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getUsers: builder.query<User[], void>({
			query: () => "/users",
			providesTags: ["User"],
		}),
		getUserById: builder.query<User, string>({
			query: (id) => `/users/${id}`,
			providesTags: (r, e, id) => [{ type: "User", id }],
		}),
		getMe: builder.query<User, void>({
			query: () => "/users/me",
			providesTags: ["User"],
		}),
		updateProfile: builder.mutation<User, Partial<User>>({
			query: (body) => ({ url: "/users/me", method: "PATCH", body }),
			invalidatesTags: ["User"],
		}),
		updateUser: builder.mutation<User, { id: string; data: Partial<User> }>({
			query: ({ id, data }) => ({
				url: `/users/${id}`,
				method: "PATCH",
				body: data,
			}),
			invalidatesTags: ["User"],
		}),
		updateUserRole: builder.mutation<
			User,
			{ id: string; role: "user" | "admin" }
		>({
			query: ({ id, role }) => ({
				url: `/users/${id}`,
				method: "PATCH",
				body: { role },
			}),
			invalidatesTags: ["User"],
		}),
		deleteUser: builder.mutation<{ success: boolean }, string>({
			query: (id) => ({ url: `/users/${id}`, method: "DELETE" }),
			invalidatesTags: ["User"],
		}),
	}),
});

export const {
	useGetUsersQuery,
	useGetUserByIdQuery,
	useGetMeQuery,
	useUpdateProfileMutation,
	useUpdateUserMutation,
	useUpdateUserRoleMutation,
	useDeleteUserMutation,
} = usersApi;
