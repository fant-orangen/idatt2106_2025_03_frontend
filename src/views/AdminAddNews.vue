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
  <div class="flex flex-row flex-wrap w-full gap-4 justify-evenly">
    <!--Form to edit fields-->
    <Card class="width min-w-fit max-h-fit">
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
                <p>{{ $t('news.description.event') }}</p>
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

              <!--Published at: if it's a draft-->
              <FormField v-if="selectedNews" v-slot="{ field }" name="publishedAt">
                <FormItem>
                  <FormLabel>{{$t('news.published')}}</FormLabel>
                  <FormControl>
                    <Input type="text" v-bind="field" readonly disabled/>
                  </FormControl>
                  <FormDescription>{{ $t('news.description.published') }}</FormDescription>
                </FormItem>
              </FormField>
            </div>  
          </div>
        </form>

      </CardContent>
      <CardFooter class="flex flex-row flex-wrap gap-5 m-auto">
        <Button 
          type="submit" 
          @click="setStatusOfArticle('published')">
          {{ $t('news.post') }}
        </Button>
        <Button v-if="status !== 'published'" 
          type="button" 
          variant="secondary"
          @click="setStatusOfArticle('draft')">
            Save draft
        </Button>
        <Button v-if="selectedDraft || selectedNews"
          type="button" 
          variant="destructive"
          @click="setStatusOfArticle('archived')">
          Archive
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          @click="cancelInput()">
          {{ $t('common.cancel') }}
        </Button>
      </CardFooter>
    </Card>
    
    <!--List of all drafts articles  -->
    <Card class="width min-w-fit max-h-96">
      <CardHeader>
        <CardTitle>Saved drafts:</CardTitle>
        <CardDescription>Velg en draft å redigere</CardDescription>
      </CardHeader>
      <CardContent class="max-h-56 overflow-y-auto pr-1">
        <InfiniteScroll :is-loading="isFetchingNextDraftsPage" :has-more="hasNextDraftsPage" @load-more="fetchNextDraftsPage">
        <div v-for="draft in allDrafts" 
          class="flex flex-col gap-1 hover:bg-muted cursor-pointer rounded-md p-2"
          @click="selectArticle(draft)">
          <span><b>{{ draft.title }}</b></span>
          <span>{{ draft.content }}</span>
          <Separator />
        </div>
      </InfiniteScroll>
      </CardContent>
    </Card>
    
    <!--Related news articles to the selected crisis event-->
    <Card v-if="relatedNews.length > 0"  class="width min-w-fit max-h-96">
      <CardHeader>
        <CardTitle>{{ $t('news.related_news') }}: </CardTitle>
        <CardDescription>Nyhetsartikler relatert til denne hendelsen:testtest</CardDescription>
      </CardHeader>
      <CardContent class="overflow-y-auto pr-1">
        <InfiniteScroll :is-loading="isFetchingNextRelatedPage" 
        :has-more="hasNextRelatedPage" 
        @load-more="fetchNextRelatedPage"
        class="heigh max-h-56">
          <div v-for="news in relatedNews" class="flex flex-col gap-3 hover:bg-muted p-2 rounded-md cursor-pointer justify-center">
            <span><b>{{ news.title }}</b></span>
            <span>{{ news.content }}</span>
            <span>{{ formatDateFull(news.publishedAt) }}</span>
            <Separator />
        </div>
        </InfiniteScroll>
      </CardContent>
    </Card>

    <!--All published news articles-->
    <Card class="min-w-fit max-h-96">
      <CardHeader>
        <CardTitle>Siste publiserte nyhetsartikler: </CardTitle>
      </CardHeader>
      <CardContent class="overflow-y-auto pr-1">
        <InfiniteScroll :is-loading="isFetchingNextNewsPage" :has-more="hasNextNewsPage" @load-more="fetchNextNewsPage">
          <div v-for="article in allNews" :key="article.id" 
          @click="selectArticle(article.id)"
          class="flex flex-col gap-3 hover:bg-muted p-2 rounded-md cursor-pointer justify-center">
            <span><b>{{ article.title }}</b></span>
            <span>{{ article.content }}</span>
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
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useInfiniteQuery, useQueryClient } from '@tanstack/vue-query'
import InfiniteScroll from '@/components/ui/InfiniteScroll.vue'
import * as z from 'zod'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Separator } from "@/components/ui/separator"
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { formatDateFull } from '@/utils/dateUtils.ts'
import type { CreateNewsDto, News, UpdateNewsArticle } from '@/models/News'
import type { CrisisEventPreviewDto } from '@/models/CrisisEvent'
import { fetchAllPreviewCrisisEvents, fetchCrisisEventById } from '@/services/CrisisEventService'
import { fetchNewsByCrisisEvent, adminUpdateNews, fetchDrafts, adminAddNews, fetchLatestNews } from '@/services/api/NewsService'
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


enum Status {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

const form = ref()
const onSubmit = ref<(e?: Event) => void>()
const { t } = useI18n()

const selectedEvent = ref<CrisisEventPreviewDto | null>(null)
const selectedNews = ref<News | null>(null)
const selectedDraft = ref<News | null>(null)
const status = ref<Status | null>(null)


onMounted(() => {
  fetchNextEventPage;
  fetchNextDraftsPage;
  fetchNextNewsPage;
  setUpForm();
});

function successToast(msg: string) {
  toast.success(msg)
}
function errorToast(msg: string) {
  toast.error(msg)
}

function cancelInput() {
  selectedDraft.value = null
  selectedNews.value = null
  selectedEvent.value = null
  form.value?.resetForm()
}

function setStatusOfArticle(inputStatus: string) {
  status.value = inputStatus as Status
  
  if (inputStatus === Status.DRAFT || inputStatus === Status.PUBLISHED) {
     handleFormSubmit(form.value)
  } else if (inputStatus === Status.ARCHIVED) {
    if (selectedDraft.value) {
      handleFormSubmit(form.value)
    } else if( selectedNews.value) {
      archivePublishedArticle(selectedNews.value.id)
    }
  }
}

/**
 * For pagination of list of related news articles to a specific crisis event
 */
const queryClient = useQueryClient()
const newsPageSize = 5
const {
  data: newsData,
  fetchNextPage: fetchNextRelatedPage,
  hasNextPage: hasNextRelatedPage,
  isFetchingNextPage: isFetchingNextRelatedPage,
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
 * For pagination of list of all news article drafts.
 * Only used if the admin wants to edit a draft
 */
const draftsPageSize = 5
const {
  data: draftsData,
  fetchNextPage: fetchNextDraftsPage,
  hasNextPage: hasNextDraftsPage,
  isFetchingNextPage: isFetchingNextDraftsPage,
} = useInfiniteQuery<News[], Error>({
  queryKey: computed(() => ['drafts']),
  queryFn: async ({ pageParam = 0 }) => {
		const pageNumber = pageParam as number;
    const page = await fetchDrafts(pageNumber, draftsPageSize);
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
 * For pagination of list of all latest news articles
 */
 const articlePageSize = 10
 const {
  data,
  fetchNextPage: fetchNextNewsPage,
  hasNextPage: hasNextNewsPage,
  isFetchingNextPage: isFetchingNextNewsPage,
} = useInfiniteQuery<News[], Error>({
  queryKey: ['articles'],
  queryFn: async ({ pageParam = 0 }) => {
		const pageNumber = pageParam as number;
		const page = await fetchLatestNews(pageNumber, articlePageSize);
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
    await queryClient.invalidateQueries({queryKey: ['news', event.id]});
  }
})

watch(selectedDraft, async (draft) => {
  if (draft) {
    await nextTick()
    form.value.resetForm()
    form.value.setValues({
      title: draft.title ?? '',
      content: draft.content ?? '',
      status: draft.status ?? 'draft',
      updatedAt: draft.updatedAt ?? '',
    })
    getEventFromArticle(draft.crisisEventId)
  }
})

watch(selectedNews, async (news) => {
  if(news) {
    await nextTick()
    form.value.resetForm()
    form.value.setValues({
      title: news.title ?? '',
      content: news.content ?? '',
      publishedAt: news.publishedAt ?? '',
    })
    getEventFromArticle(news.crisisEventId)
  }
})

async function getEventFromArticle(crisisId: number) {
  try {
    const response = await fetchCrisisEventById(crisisId)
    selectedEvent.value = response;
  } catch (error) {
    console.error('Failed to fetch the crisis event', error)
  }
}


async function selectArticle(article: News) {
  if (!article || article == undefined || article == null) {
    console.error('The selected article doesnt exist')
    return;
  }
  if (article.status == Status.PUBLISHED) {
    selectedNews.value = article
    selectedDraft.value = null
  } else if(article.status == Status.DRAFT) {
    selectedDraft.value = article
    selectedNews.value = null
  }
}


function setUpForm() {
  const formSchema = toTypedSchema(z.object({
    title: z.string().min(2).max(50),
    content: z.string().max(500).optional(),
    updatedAt: z.string().optional(),
    publishedAt: z.string().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
  }))
  form.value = useForm({validationSchema: formSchema})
  onSubmit.value = form.value.handleSubmit(handleFormSubmit)
}


function handleFormSubmit(values: any) {
  if (!selectedDraft.value && !selectedNews.value) {
    if (values && selectedEvent.value) {
      const newArticle: CreateNewsDto = {
        title: values.title ?? '',
        content: values.content ?? '',
        crisisEventId: selectedEvent.value?.id,
        status: status.value as Status,
      }
      saveNewArticle(newArticle)
    }
    console.error('Need to select a draft first!')
    return;
  }
  if (selectedDraft.value) {
    const updatedDraft: UpdateNewsArticle = {
      title: values.title ?? selectedDraft.value.title,
      content: values.content ?? selectedDraft.value.content,
      status: status.value as Status,
    }
    saveUpdatesOfArticle(updatedDraft)
  }
}

async function saveUpdatesOfArticle(updatedData: UpdateNewsArticle) {
  if (!selectedDraft.value) {
    console.warn('no selected draft to save!')
    return;
  }
  try {
    const response = await adminUpdateNews(selectedDraft.value.id, updatedData)
    console.log('updated the draft: ', response.data)
    successToast('Oppdaterte artikkelen!')
    cancelInput()
  } catch (error) {
    console.error('Failed to send updated data to backend API')
  }
}

async function archivePublishedArticle(id: number) {
  try {
    if (status.value !== Status.ARCHIVED) {
      status.value = Status.ARCHIVED
    }
    handleFormSubmit(form.value);
  } catch (error) {
    console.error('Failed to archive the article')
  }
}

async function saveNewArticle(data: CreateNewsDto) {
  try {
    const response = await adminAddNews(data)
    console.log('Lagra et nytt varsel ', response)
  } catch (error) {
    console.error('Failed to save the new article')
  }
}
</script>