import type { QueryFunction } from '@tanstack/react-query';
import { sermonApi } from '../api/sermonApi';
import { eventApi } from '../api/eventApi';
import { announcementApi } from '../api/announcementApi';
import { bookApi } from '../api/bookApi';
import { blogApi } from '../api/blogApi';
import { ministryApi } from '../api/ministryApi';
import { accountApi } from '../api/accountApi';

export interface RouteQuery {
  queryKey: unknown[];
  queryFn: QueryFunction<unknown>;
}

export interface RouteQueryEntry {
  pattern: string;
  getQueries: (params: Record<string, string | undefined>) => RouteQuery[];
}

export const routeQueryMap: RouteQueryEntry[] = [
  {
    pattern: '/',
    getQueries: () => [
      {
        queryKey: ['featuredSermons'],
        queryFn: () =>
          sermonApi.getAll({ pageSize: 3, isFeatured: true }).then(res => res.data.data?.items ?? []),
      },
      {
        queryKey: ['homeUpcomingEvents'],
        queryFn: () =>
          eventApi.getUpcoming({ pageSize: 3 }).then(res => res.data.data?.items ?? []),
      },
      {
        queryKey: ['homeOngoingEvents'],
        queryFn: () =>
          eventApi.getOngoing({ pageSize: 3 }).then(res => res.data.data?.items ?? []),
      },
      {
        queryKey: ['homeAnnouncements'],
        queryFn: () =>
          announcementApi.getAll({ pageSize: 3, module: 'Ministry' }).then(res => res.data.data?.items ?? []),
      },
      {
        queryKey: ['featuredBooks'],
        queryFn: () =>
          bookApi.getPublished({ pageSize: 10, pageNumber: 1 }).then(res => res.data.data?.items ?? []),
      },
      {
        queryKey: ['homeBlogPosts'],
        queryFn: () =>
          blogApi
            .getPublishedPosts({ pageSize: 3, pageNumber: 1, sortBy: 'createdOn', isDescending: true })
            .then(res => res.data.data?.items ?? []),
      },
    ],
  },
  {
    pattern: '/sermons',
    getQueries: () => [
      {
        queryKey: ['publishedSermons', 'Conference'],
        queryFn: () =>
          sermonApi.getAll({ pageSize: 100, category: 'Conference' }).then(res => res.data.data?.items ?? []),
      },
    ],
  },
  {
    pattern: '/sermons/series/:seriesSlug',
    getQueries: () => [
      {
        queryKey: ['seriesDetailSermons'],
        queryFn: () =>
          sermonApi.getAll({ pageSize: 100 }).then(res => res.data.data?.items ?? []),
      },
    ],
  },
  {
    pattern: '/sermons/:slug',
    getQueries: (params) => [
      {
        queryKey: ['sermonDetail', params.slug],
        queryFn: async () => {
          const response = await sermonApi.getBySlug(params.slug!);
          if (!response.data.isSuccess || !response.data.data) return null;
          const sermonData = response.data.data;
          const allResponse = await sermonApi.getAll({ pageSize: 50, series: sermonData.series });
          const all = (allResponse.data.data?.items ?? [])
            .slice()
            .sort((a, b) => new Date(a.sermonDate).getTime() - new Date(b.sermonDate).getTime());
          return { activeSermon: sermonData, allSeriesSermons: all };
        },
      },
    ],
  },
  {
    pattern: '/events',
    getQueries: () => [
      {
        queryKey: ['eventsPageUpcoming'],
        queryFn: () =>
          eventApi.getUpcoming({ pageSize: 20 }).then(res => res.data.data?.items ?? []),
      },
      {
        queryKey: ['eventsPageOngoing'],
        queryFn: () =>
          eventApi.getOngoing({ pageSize: 20 }).then(res => res.data.data?.items ?? []),
      },
      {
        queryKey: ['pastEvents'],
        queryFn: () =>
          eventApi.getPast({ pageSize: 20 }).then(res => res.data.data?.items ?? []),
      },
    ],
  },
  {
    pattern: '/events/:slug',
    getQueries: (params) => [
      {
        queryKey: ['event', params.slug],
        queryFn: async () => {
          const response = await eventApi.getBySlug(params.slug!);
          if (!response.data.isSuccess || !response.data.data)
            throw new Error(response.data.message || 'Event not found');
          return response.data.data;
        },
      },
    ],
  },
  {
    pattern: '/ministries',
    getQueries: () => [
      {
        queryKey: ['ministries'],
        queryFn: () =>
          ministryApi.getAll({ pageSize: 50 }).then(res => res.data.data?.items ?? []),
      },
    ],
  },
  {
    pattern: '/ministries/:slug',
    getQueries: (params) => [
      {
        queryKey: ['ministry', params.slug],
        queryFn: async () => {
          const res = await ministryApi.getBySlug(params.slug!);
          if (!res.data.isSuccess || !res.data.data) throw new Error(res.data.message || 'Ministry not found.');
          return res.data.data;
        },
      },
      {
        queryKey: ['ministryEvents', params.slug],
        queryFn: () =>
          ministryApi.getMinistryEvents(params.slug!, { pageSize: 50 }).then(res => res.data.data?.items ?? []),
      },
    ],
  },
  {
    pattern: '/blog',
    getQueries: () => [
      {
        queryKey: ['publishedBlogPosts', 1, 9, 'All', ''],
        queryFn: async () => {
          const response = await blogApi.getPublishedPosts({ pageNumber: 1, pageSize: 9 });
          if (!response.data.isSuccess) throw new Error(response.data.message || 'Failed to load posts');
          return {
            items: response.data.data?.items ?? [],
            totalCount: response.data.data?.totalCount ?? 0,
          };
        },
      },
    ],
  },
  {
    pattern: '/blog/:slug',
    getQueries: (params) => [
      {
        queryKey: ['blogPost', params.slug],
        queryFn: async () => {
          const response = await blogApi.getBlogPostBySlug(params.slug!);
          if (!response.data.isSuccess || !response.data.data)
            throw new Error(response.data.message || 'Post not found');
          const postData = response.data.data;
          const relatedResponse = await blogApi.getPublishedPosts({
            department: postData.department,
            pageSize: 4,
          });
          const relatedPosts = (relatedResponse.data.data?.items ?? [])
            .filter((item) => item.slug !== params.slug)
            .slice(0, 3);
          return { post: postData, relatedPosts };
        },
      },
    ],
  },
  {
    pattern: '/books',
    getQueries: () => [
      {
        queryKey: ['publishedBooks'],
        queryFn: () =>
          bookApi.getPublished({ pageSize: 50, pageNumber: 1 }).then(res => {
            if (!res.data.isSuccess) throw new Error('Could not load books right now.');
            return res.data.data?.items ?? [];
          }),
      },
    ],
  },
  {
    pattern: '/dashboard',
    getQueries: () => [
      {
        queryKey: ['myProfile'],
        queryFn: async () => {
          const res = await accountApi.getProfile();
          if (!res.data.isSuccess || !res.data.data) throw new Error('Could not load profile');
          return res.data.data;
        },
      },
    ],
  },
];
