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
  <h1 class="text-3xl p-3">Skriv eller rediger nyhetsvarsler</h1>
  <div class="flex justify-center">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-evenly">
      
      <!--Form to edit fields-->
      <Card class="flex-1 basis-[350px] max-w-[400px] max-h-fit shadow-md hover:shadow-xl transition-shadow">
        <CardHeader>
          <CardTitle>{{$t('navigation.admin-news')}}</CardTitle>
        </CardHeader>
        <CardContent class="max-h-fit">
          <form @submit.prevent="onSubmit">
            <div class="flex flex-col gap-5">
              <!-- Title -->
              <FormField v-slot="{ field, meta, errorMessage }" name="title">
                <FormItem>
                  <FormLabel>{{$t('news.news-title')}}</FormLabel>
                  <FormControl>
                    <Input type="text" v-bind="field" :readonly="isReadonly" :disabled="isReadonly" />
                  </FormControl>
                  <FormDescription>{{ $t('news.description.title') }}</FormDescription>
                  <FormMessage v-if="meta.touched && meta.validated">{{ errorMessage }}</FormMessage>
                </FormItem>
              </FormField>

              <!--Content -->
              <FormField v-slot="{ field, meta, errorMessage }" name="content">
                <FormItem>
                  <FormLabel>{{$t('news.content')}}</FormLabel>
                  <FormControl>
                    <Textarea v-bind="field" class="min-h-28" :readonly="isReadonly" :disabled="isReadonly" />
                  </FormControl>
                  <FormDescription>{{ $t('news.description.subject') }}</FormDescription>
                  <FormMessage v-if="meta.touched && meta.validated">{{ errorMessage }}</FormMessage>
                </FormItem>
              </FormField>
              
              <!--Select / search field for a crisis event-->
              <div>
                <Combobox :disabled="isReadonly" v-model="selectedEvent">
                  <ComboboxAnchor as-child>
                    <ComboboxTrigger as-child :disabled="isReadonly">
                      <Button variant="outline" class="justify-between">
                        {{ selectedEvent?.name ?? t('news.select')}}
                        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </ComboboxTrigger>
                  </ComboboxAnchor>

                  <ComboboxList>
                    <div class="relative w-full max-w-sm items-center">
                      <ComboboxInput :placeholder="t('news.search')" :disabled="isReadonly">
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
                <p class="text-muted-foreground text-sm">{{ $t('news.description.event') }}</p>
              </div>
              <!--Last updated at: if it's a draft-->
              <FormField v-if="selectedDraft" v-slot="{ field }" name="updatedAt">
              <FormItem>
                <FormLabel>{{$t('news.updated')}}</FormLabel>
                <FormControl>
                  <Input class="max-w-fit" type="text" v-bind="field" readonly disabled/>
                </FormControl>
                <FormDescription>{{ $t('news.description.updated') }}</FormDescription>
              </FormItem>
              </FormField>

              <!--Published at: if it's a published article -->
              <FormField v-if="selectedNews" v-slot="{ field }" name="publishedAt">
                <FormItem>
                  <FormLabel>{{$t('news.published')}}</FormLabel>
                  <FormControl>
                    <Input class="max-w-fit" type="text" v-bind="field" readonly disabled/>
                  </FormControl>
                  <FormDescription>{{ $t('news.description.published') }}</FormDescription>
                </FormItem>
              </FormField>

               <!--Buttons -->
              <div class="flex flex-row flex-wrap gap-3 m-auto justify-evenly">
                <Button
                  type="submit" 
                  @click="setStatusOfArticle('published')"
                  :disabled="isReadonly">
                  {{ $t('news.post') }}
                </Button>
                <Button v-if="!selectedNews" 
                  type="button" 
                  variant="secondary"
                  @click="setStatusOfArticle('draft')">
                    {{ $t('news.save-draft') }}
                </Button>
                <Button v-if="selectedDraft || selectedNews"
                  type="button" 
                  variant="destructive"
                  @click="setStatusOfArticle('archived')">
                  {{ $t('news.archive') }}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  @click="cancelInput()">
                  {{ $t('common.cancel') }}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter >
          
        </CardFooter>
      </Card>

      <div class="flex flex-col gap-5">
        <!--List of all drafts articles  -->
        <Card class="flex-1 basis-[350px] max-w-[400px] max-h-fit shadow-md hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle>Saved drafts by you and other admins:</CardTitle>
            <CardDescription>Velg en draft å redigere</CardDescription>
          </CardHeader>
          <CardContent class="max-h-[500px] overflow-y-auto pr-2">
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
        <Card v-if="relatedNews.length > 0" class="flex-1 basis-[350px] max-w-[400px] max-h-fit shadow-md hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle>{{ $t('news.related_news') }}: </CardTitle>
            <CardDescription>Nyhetsartikler relatert til denne hendelsen:testtest</CardDescription>
          </CardHeader>
          <CardContent class="overflow-y-auto max-h-[500px] pr-2">
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
      </div>

      <!--All published news articles-->
      <Card class="flex-1 basis-[350px] max-w-[400px] max-h-fit shadow-md hover:shadow-xl transition-shadow">
        <CardHeader>
          <CardTitle>Siste publiserte nyhetsartikler: </CardTitle>
        </CardHeader>
        <CardContent class="overflow-y-auto max-h-[500px] pr-2">
          <InfiniteScroll :is-loading="isFetchingNextNewsPage" :has-more="hasNextNewsPage" @load-more="fetchNextNewsPage">
            <div v-for="article in allNews" :key="article.id" 
            @click="selectArticle(article)"
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
import { useForm, type SubmissionContext} from 'vee-validate'
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

const { t } = useI18n()
const selectedEvent = ref<CrisisEventPreviewDto | null>(null)
const selectedNews = ref<News | null>(null)
const selectedDraft = ref<News | null>(null)
const status = ref<Status | null>(null)
const isReadonly = computed(() => !!selectedNews.value)

const formSchema = toTypedSchema(z.object({
  title: z.string().min(2).max(50),
  content: z.string().max(500),
  updatedAt: z.string().optional(),
  publishedAt: z.string().optional(),
}))
const form = useForm({ validationSchema: formSchema})
const onSubmit = form.handleSubmit(handleFormSubmit)


onMounted(() => {
  fetchNextEventPage()
  fetchNextDraftsPage()
  fetchNextNewsPage()
});

function successToast(msg: string) {
  toast.success(msg)
}
function errorToast(msg: string) {
  toast.error(msg)
}

function cancelInput() {
  form.resetForm()
  selectedDraft.value = null
  selectedNews.value = null
  selectedEvent.value = null
}

function setStatusOfArticle(inputStatus: string) {
  status.value = inputStatus as Status
  
  if (inputStatus === Status.DRAFT || inputStatus === Status.PUBLISHED) {
     onSubmit()
  } else if (inputStatus === Status.ARCHIVED) {
    if (selectedDraft.value) {
      onSubmit()
    } else if( selectedNews.value) {
      archivePublishedArticle()
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
    selectedNews.value = null
    await nextTick()
    form.resetForm()
    form.setValues({
      title: draft.title ?? '',
      content: draft.content ?? '',
      updatedAt: formatDateFull(draft.updatedAt) ?? '',
    })
    getEventFromArticle(draft.crisisEventId)
  }
})

watch(selectedNews, async (news) => {
  if(news) {
    selectedDraft.value = null
    await nextTick()
    form.resetForm()
    form.setValues({
      title: news.title ?? '',
      content: news.content ?? '',
      publishedAt: formatDateFull(news.publishedAt) ?? '',
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
  if (!article) {
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
      return;
    } else {
      errorToast('Du må assosiere et utkast med en hendelse før du lagrer!')
      return;
    }
  } else {
    if (selectedDraft.value) {
      const updatedDraft: UpdateNewsArticle = {
        title: values.title ?? selectedDraft.value.title,
        content: values.content ?? selectedDraft.value.content,
        status: status.value as Status,
      }
      saveUpdatesOfArticle(selectedDraft.value.id, updatedDraft)
      selectedDraft.value = null
    } else {
      errorToast('Det har skjedd en feil, prøv igjen.')
    }
  }
}

async function saveUpdatesOfArticle(id: number, updatedData: UpdateNewsArticle) {
  try {
    const response = await adminUpdateNews(id, updatedData)
    console.log('updated the draft: ', response.data)
    successToast('Oppdaterte artikkelen!')
    cancelInput()
    updateLists()
  } catch (error) {
    console.error('Failed to send updated data to backend API')
  }
}

async function archivePublishedArticle() {
  if(!selectedNews.value) {
    errorToast("Velg et nyhetsvarsel for å kunne arkivere det!")
    return;
  }
  if (status.value === Status.ARCHIVED) {
    try {
      const archiveData: UpdateNewsArticle = {
        title: selectedNews.value.title,
        content: selectedNews.value.content,
        status: status.value
      }
      saveUpdatesOfArticle(selectedNews.value.id, archiveData)
    } catch (error) {
      console.error('Failed to archive the article')
    }
  }
}

async function saveNewArticle(data: CreateNewsDto) {
  try {
    const response = await adminAddNews(data)
    console.log('Lagra et nytt varsel ', response)
    cancelInput()
    updateLists()
  } catch (error) {
    console.error('Failed to save the new article')
  }
}

async function updateLists() {
  await queryClient.invalidateQueries({queryKey: ['articles']});
  await queryClient.invalidateQueries({queryKey: ['drafts']});
}
</script>