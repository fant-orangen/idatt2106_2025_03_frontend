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
  <Button v-if="!edit" type="button" @click="editDraft()">Rediger en draft</Button>
  <Button v-if="edit" type="button" @click="editDraft()">Tilbake</Button>
  <div class="flex flex-row flex-wrap gap-4 justify-center">
    <div class="flex flex-row flex-wrap gap-4 justify-center">
      <!--Form to edit fields-->
      <Card >
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
              
              <div class="flex flex-row flex-wrap gap-5 justify-evenly">
                <!--Select / search field for a crisis event-->
                <div>
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
                  <p>{{ $t('news.description.event') }}</p> <!--Fix class to match with for description-->
                </div>
                <!--Last updated at: if it's a draft-->
                <FormField v-if="selectedDraft" v-slot="{ field }" name="updatedAt">
                <FormItem>
                  <FormLabel>{{$t('news.updated')}}</FormLabel>
                  <FormControl>
                    <Input type="text" v-bind="field" readonly disabled/>
                  </FormControl>
                  <FormDescription>{{ $t('news.description.updated') }}</FormDescription>
                </FormItem>
              </FormField>
              </div>  
            </div>
          </form>

        </CardContent>
        <CardFooter class="flex flex-row flex-wrap gap-5 m-auto">
          <Button>{{ $t('news.post') }}</Button>
          <Button v-if="status !== 'PUBLISHED'" type="button" variant="secondary">Save draft</Button>
          <Button v-if="selectedDraft || selectedNews" type="button" variant="destructive">Archive</Button>
          <Button type="button" variant="outline" @click="cancelInput()">{{ $t('common.cancel') }}</Button>
        </CardFooter>
      </Card>
      
      <!--List of all news article drafts to this user-->
      <Card class="grid grid-cols-1 min-w-1/4 max-w-1/2">
        <CardHeader>
          <CardTitle>Your drafts:</CardTitle>
          <CardDescription>Velg en draft å redigere</CardDescription>
        </CardHeader>
        <CardContent>
          <InfiniteScroll :is-loading="isFetchingNextDraftsPage" :has-more="hasNextDraftsPage" @load-more="fetchNextDraftsPage">
          <div v-for="draft in allDrafts" class="flex flex-col gap-1 hover:bg-blend-darken cursor-pointer rounded-md p-2">
            <span><b>{{ draft.title }}</b></span>
            <span>{{ draft.content }}</span>
            <span>{{ draft.status }}</span>
            <Separator />
          </div>
        </InfiniteScroll>
        </CardContent>
      </Card>
    </div>
    
    <!--Related news articles to the selected crisis event-->
    <Card v-if="selectedEvent" class="width max-w-1/3">
      <CardHeader>
        <CardTitle>{{ $t('news.related_news') }}: </CardTitle>
        <CardDescription>Nyhetsartikler relatert til denne hendelsen:testtest</CardDescription>
      </CardHeader>
      <CardContent>
        <InfiniteScroll :is-loading="isFetchingNextNewsPage" :has-more="hasNextNewsPage" @load-more="fetchNextNewsPage">
          <div v-for="news in relatedNews" class="flex flex-col gap-2">
            <span><b>{{ news.title }}</b></span>
            <span>{{ news.content }}</span>
            <span>{{ formatDateFull(news.publishedAt) }}</span>
            <Separator />
          </div>
        </InfiniteScroll>
      </CardContent>
    </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alle publiserte nyhetsartikler: </CardTitle>
        </CardHeader>
        <CardContent>
          <InfiniteScroll :is-loading="isFetchingNextPage" :has-more="hasNextPage" @load-more="fetchNextPage">
            <div v-for="article in allNews" :key="article.id" 
            @click="selectPublishedArticle(article.id)"
            class="flex flex-col gap-3 hover:bg-blend-darken cursor-pointer">
              <span>{{ article.title }}</span>
              <span>{{ formatDateFull(article.publishedAt) }}</span>
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
import type { News, UpdateNewsArticle } from '@/models/News'
import type { CrisisEventPreviewDto } from '@/models/CrisisEvent'
import { fetchAllPreviewCrisisEvents } from '@/services/CrisisEventService'
import { fetchNewsByCrisisEvent, adminUpdateNews, fetchDraftsByUserId, adminAddNews, fetchPaginatedGeneralNews, fetchNewsArticleById } from '@/services/api/NewsService'
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
import { useUserStore } from '@/stores/UserStore'

enum Status {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

const userStore = useUserStore()
const form = ref()
const onSubmit = ref<(e?: Event) => void>()
const { t } = useI18n()

const edit = ref(false)
const showRelatedNews = ref(false)
const selectedEvent = ref<CrisisEventPreviewDto | null>(null)
const selectedNews = ref<News | null>(null)
const selectedDraft = ref<News | null>(null)
const status = ref<Status | null>(null)


onMounted(() => {
  fetchNextEventPage;
  setUpForm()
});

function successToast(msg: string) {
  toast.success(msg)
}
function errorToast(msg: string) {
  toast.error(msg)
}

function cancelInput() {
  selectedDraft.value = null
  form.value?.resetForm()
}

/**
 * For pagination of list of related news articles to a specific crisis event
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
		const page = await fetchNewsByCrisisEvent(eventId, pageNumber, newsPageSize);
		return page.content;
	},
  getNextPageParam: (lastPage, allPages) => {
    return lastPage.length < newsPageSize ? undefined : allPages.length;
	},
	initialPageParam: 0
});
const relatedNews = computed<News[]>(() => newsData.value?.pages.flat() ?? [])

/**
 * For pagination of list of all news article drafts created by the current user.
 * Only used if the admin wants to edit a draft
 */
const draftsPageSize = 10
const {
  data: draftsData,
  fetchNextPage: fetchNextDraftsPage,
  hasNextPage: hasNextDraftsPage,
  isFetchingNextPage: isFetchingNextDraftsPage,
} = useInfiniteQuery<News[], Error>({
  queryKey: computed(() => ['drafts']),
  queryFn: async ({ pageParam = 0 }) => {
		const pageNumber = pageParam as number;
    if (userStore.userId) {
      // legg til userID i backend kall senere 
    }
    const page = await fetchDraftsByUserId(pageNumber, draftsPageSize);
    return page.content;
	},
  getNextPageParam: (lastPage, allPages) => {
    return lastPage.length < draftsPageSize ? undefined : allPages.length;
	},
	initialPageParam: 0
});
const allDrafts = computed<News[]>(() => draftsData.value?.pages.flat() ?? [])


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


/**
 * For pagination of list of all news articles
 */
 const articlePageSize = 10
 const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery<News[], Error>({
  queryKey: ['articles'],
  queryFn: async ({ pageParam = 0 }) => {
		const pageNumber = pageParam as number;
		const page = await fetchPaginatedGeneralNews(pageNumber, articlePageSize);
		return page.content;
	},
  getNextPageParam: (lastPage, allPages) => {
    return lastPage.length < articlePageSize ? undefined : allPages.length;
	},
	initialPageParam: 0
});
const allNews = computed<News[]>(() => data.value?.pages.flat() ?? [])



watch(selectedEvent, async (event) => {
  if (event) {
    showRelatedNews.value = true
    await queryClient.invalidateQueries({queryKey: ['news', event.id]});
  }
})

watch (edit, async () => {
  if(edit) {
    await queryClient.invalidateQueries({queryKey: ['drafts']});
  }
})

watch(selectedDraft, (draft) => {
  if (draft) {
    form.value.setValues({
      title: draft.title ?? '',
      content: draft.content ?? '',
      status: draft.status ?? 'DRAFT',
      updatedAt: draft.updatedAt ?? '',
    })
  }
})

watch(selectedNews, (news) => {
  if(news) {
    form.value.setValues({
      title: news.title ?? '',
      content: news.content ?? '',
      status: news.status ?? 'DRAFT',
      updatedAt: news.publishedAt ?? '',
    })
  }
})


function editDraft() {
  edit.value = !edit.value
}

async function selectPublishedArticle(articleId: number) {
  if (!articleId || articleId == undefined || articleId == null) {
    console.error('The selected article doesnt have an id')
    return;
  }
  try {
    selectedNews.value = await fetchNewsArticleById(articleId)
    console.log(selectedNews.value)
  } catch (error) {
    console.log('failed to fetch article info', error)
  }
}
  


function setUpForm() {
  const formSchema = toTypedSchema(z.object({
    title: z.string().min(2).max(50),
    content: z.string().max(500).optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  }))
  form.value = useForm({validationSchema: formSchema})
  onSubmit.value = form.value.handleSubmit(handleFormSubmit)
}


function handleFormSubmit(values: any) {
  if (!selectedDraft.value) {
    console.error('Need to select a draft first!')
    return;
  } 
  const updatedDraft: UpdateNewsArticle = {
    title: values.title ?? selectedDraft.value.title,
    content: values.content ?? selectedDraft.value.content,
    status: status.value as Status, // når bruker trykker feks 'arkiver' skal status.value settes til ARCHIVE, skjønte duuu??
  }
}

</script>