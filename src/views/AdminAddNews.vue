<template>
  <div class="p-5">
    <Breadcrumb>
      <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href="/">
        {{ $t('navigation.home') }}
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator/>
      <BreadcrumbItem>
        <BreadcrumbLink href="/admin/admin-panel">
        {{ $t('navigation.admin-panel') }}
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator/>
      <BreadcrumbItem>
        <BreadcrumbLink href="/admin/news">
        {{ $t('navigation.admin-news') }}
        </BreadcrumbLink>
      </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  </div>

<div class="p-5">
  <h1 class="text-3xl p-3">Title</h1>
  <Button type="button" @click="editDraft()">Rediger en draft</Button>
  <div v-if="!edit" class="flex flex-row flex-wrap gap-4 justify-center">
    <Card>
      <CardHeader>
        <CardTitle>{{$t('navigation.admin-news')}}</CardTitle>
      </CardHeader>
      <CardContent class="width min-w-fit max-w-4/6">
        <form @submit.prevent="onSubmit">
          <div class="flex flex-col gap-5">
            <!-- Tittel -->
            <FormField v-slot="{ field, meta, errorMessage }" name="title">
              <FormItem>
                <FormLabel>{{$t('news.news-title')}}</FormLabel>
                <FormControl>
                  <Input type="text" v-bind="field" />
                </FormControl>
                <FormDescription>{{ $t('news.description.title') }}</FormDescription>
                <FormMessage v-if="meta.touched && meta.validated">{{ errorMessage }}</FormMessage>
              </FormItem>
            </FormField>

            <!--Innhold -->
            <FormField v-slot="{ field, meta, errorMessage }" name="content">
              <FormItem>
                <FormLabel>{{$t('news.content')}}</FormLabel>
                <FormControl>
                  <Textarea v-bind="field" class="border rounded-md shadow w-full min-h-28" />
                </FormControl>
                <FormDescription>{{ $t('news.description.subject') }}</FormDescription>
                <FormMessage v-if="meta.touched && meta.validated">{{ errorMessage }}</FormMessage>
              </FormItem>
            </FormField>
          
            <Combobox v-model="selectedEvent">
              <ComboboxAnchor as-child>
                <ComboboxTrigger as-child>
                  <Button variant="outline" class="justify-between">
                    {{ selectedEvent?.name ?? t('news.select')}}
                    <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </ComboboxTrigger>
              </ComboboxAnchor>

              <ComboboxList>
                <div class="relative w-full max-w-sm items-center">
                  <ComboboxInput :placeholder="t('news.search')">
                    <span class="absolute start-0 inset-y-0 flex item-center justify-center px-3">
                      <Search class="size-4 text-muted-foreground"/>
                    </span>   
                  </ComboboxInput>
                </div>
                <ComboboxEmpty>
                  {{ $t('common.not-found') }}
                </ComboboxEmpty>

                <ComboboxGroup>
                  <ComboboxItem v-for="event in allEvents" 
                    :key="event.id" :value="event">
                    <span>{{ event.name }}</span>
                    <span v-if="event.severity === 'red'" class="bg-chart-1 rounded-md p-0.25">{{ t('add-event-info.crisis-level.' + event.severity) }}</span>
                    <span v-if="event.severity === 'yellow'" class="bg-chart-4 rounded-md p-0.25" >{{ t('add-event-info.crisis-level.' + event.severity) }}</span>
                    <span v-if="event.severity === 'green'" class="bg-chart-2 rounded-md p-0.25" >{{ t('add-event-info.crisis-level.' + event.severity) }}</span>
                    <ComboboxItemIndicator>
                      <Check class='ml-auto h-4 w-4'/>
                    </ComboboxItemIndicator>
                  </ComboboxItem>
                </ComboboxGroup>
              </ComboboxList>
            </Combobox>
            <p>{{ $t('news.description.event') }}</p>
          
          </div>

        </form>

      </CardContent>
      <CardFooter class="flex flex-col flex-wrap gap-5 m-auto">
        <CardDescription>Card Description</CardDescription>
        
        <div class="flex flex-row flex-wrap gap-3">
          <Button>{{ $t('news.post') }}</Button>
          <Button v-if="!published" type="button" variant="secondary">Save draft</Button>
          <Button v-if="selectedNews" type="button" variant="destructive">Archive</Button>
          <Button type="button" variant="outline">{{ $t('common.cancel') }}</Button>
        </div>
      </CardFooter>
    </Card>

    <Card v-if="selectedEvent" class="w-xl">
      <CardHeader>
        <CardTitle>related crisis event news articles</CardTitle>
        <CardDescription>Nyhetsartikler relatert til denne hendelsen:</CardDescription>
      </CardHeader>
      <CardContent>
        <InfiniteScroll :is-loading="isFetchingNextNewsPage" :has-more="hasNextNewsPage" @load-more="fetchNextNewsPage">
          <div v-for="news in relatedNews" class="flex flex-col gap-1">
            <span><b>{{ news.title }}</b></span>
            <span>{{ news.content }}</span>
            <span>{{  formatDateFull(news.publishedAt) }}</span>
            <Separator />
          </div>
        </InfiniteScroll>
      </CardContent>
    </Card>
  </div>
</div>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner'
import { ref, onMounted, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useInfiniteQuery, useQueryClient } from '@tanstack/vue-query'
import InfiniteScroll from '@/components/ui/InfiniteScroll.vue'
import * as z from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from "@/components/ui/separator"
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { formatDateFull } from '@/utils/dateUtils.ts'
import type { News } from '@/models/News'
import type { CrisisEventPreviewDto } from '@/models/CrisisEvent'
import { fetchAllPreviewCrisisEvents } from '@/services/CrisisEventService'
import { fetchNewsByCrisisEvent, adminUpdateNews, adminAddNews } from '@/services/api/NewsService'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Combobox, ComboboxAnchor, ComboboxEmpty, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxItemIndicator, ComboboxList, ComboboxTrigger } from '@/components/ui/combobox'
import { Check, ChevronsUpDown, Search } from 'lucide-vue-next'

const { t } = useI18n()
const edit = ref(false)
const showRelatedNews = ref(false)
const selectedEvent = ref<CrisisEventPreviewDto | null>(null)
const selectedNews = ref<News | null>(null)
const published = ref(false)
onMounted(() => {
  fetchNextEventPage;
});

/**
 * For pagination of list of related news articles:
 */
const queryClient = useQueryClient()
const newsPageSize = 5

const {
  data: newsData,
  fetchNextPage: fetchNextNewsPage,
  hasNextPage: hasNextNewsPage,
  isFetchingNextPage: isFetchingNextNewsPage,
} = useInfiniteQuery<News[], Error>({
  queryKey: computed(() => ['news', selectedEvent.value?.id]),
  enabled: computed(() => !!selectedEvent.value),
  queryFn: async ({ pageParam = 0 }) => {
    const eventId = selectedEvent.value?.id
    if (!eventId) return []
		const pageNumber = pageParam as number;
		const page = await fetchNewsByCrisisEvent(eventId, pageParam, newsPageSize);
		return page.content;
	},
  getNextPageParam: (lastPage, allPages) => {
    return lastPage.length < newsPageSize ? undefined : allPages.length;
	},
	initialPageParam: 0
});
const relatedNews = computed<News[]>(() => newsData.value?.pages.flat() ?? [])

/**
 * For pagination of list of all news articles.
 * Only used if the admin wants to edit a draft
 */

const allNewsPageSize = 10

const {
  data: articlesData,
  fetchNextPage: fetchAllNewsPage,
  hasNextPage: hasNextAllNewsPage,
  isFetchingNextPage: isFetchingNextAllNewsPage,
} = useInfiniteQuery<News[], Error>({
  queryKey: computed(() => ['news']),
  queryFn: async ({ pageParam = 0 }) => {
		const pageNumber = pageParam as number;
		const page = await (pageParam, allNewsPageSize);
		return page.content;
	},
  getNextPageParam: (lastPage, allPages) => {
    return lastPage.length < allNewsPageSize ? undefined : allPages.length;
	},
	initialPageParam: 0
});
const allNews = computed<News[]>(() => articlesData.value?.pages.flat() ?? [])


/**
 * For pagination of list of all events:
 */
 const eventPageSize = 10
 const {
  data: eventData,
  fetchNextPage: fetchNextEventPage,
  hasNextPage: hasNextEventPage,
  isFetchingNextPage: isFetchingNextEventPage,
} = useInfiniteQuery<CrisisEventPreviewDto[], Error>({
  queryKey: ['events'],
  queryFn: async ({ pageParam = 0 }) => {
		const pageNumber = pageParam as number;
		const page = await fetchAllPreviewCrisisEvents(pageNumber, eventPageSize);
		return page.content;
	},
  getNextPageParam: (lastPage, allPages) => {
    return lastPage.length < eventPageSize ? undefined : allPages.length;
	},
	initialPageParam: 0
});
const allEvents = computed<CrisisEventPreviewDto[]>(() => eventData.value?.pages.flat() ?? [])

watch(selectedEvent, async (event) => {
  if (event) {
    showRelatedNews.value = true
    await queryClient.invalidateQueries({queryKey: ['news', event.id]});
  }
})

watch (edit, async () => {
  await queryClient.invalidateQueries({queryKey: ['news']});
})

function editDraft() {
  edit.value = true
}

</script>