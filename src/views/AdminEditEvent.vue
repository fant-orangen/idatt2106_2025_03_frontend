<template>
<div style="margin:20px">
	<Breadcrumb>
		<BreadcrumbList>
			<BreadcrumbItem>
				<BreadcrumbLink href="/admin-panel">
				{{ $t('navigation.admin-panel') }}
				</BreadcrumbLink>
			</BreadcrumbItem>
			<BreadcrumbSeparator/>
			<BreadcrumbItem>
				<BreadcrumbPage href="/add-new-event">{{ $t('navigation.new-event') }}</BreadcrumbPage>
			</BreadcrumbItem>
		</BreadcrumbList>
	</Breadcrumb>
</div>
<h1>Current events:</h1>

<div class="page">
    <div class="events">
        <ScrollArea class="h-72 w-48 rounded-md border">
            <div class="p-4">
                <h4 class="mb-4 text-sm font-medium leading-none">
                    Events
                </h4>

                <div v-for="event in events" :key="event.id" @click="selectedEvent = event">
                    <div class="text-sm hover:underline cursor-pointer">
                        {{ event.title }} - {{ event.priority }}
                    </div>
                    <Separator class="my-2" />
                </div>
            </div>
        </ScrollArea>
    </div>

    <div class="edit" v-if="selectedEvent">
        <h3>Edit event:</h3>
        
    </div>
</div>
    

</template>

<script setup lang="ts">
import { getCurrentEvents } from '@/services/api/AdminServices'
import { ref, onMounted } from 'vue'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator, 
} from '@/components/ui/breadcrumb'

const events = ref<any[]>([]);
const selectedEvent = ref<any>(null);

/**
 * When the component is loaded, the events saved will be displayed automatically.
 * Awaits response from getCurrentEvents() from backend server.
 */
onMounted(async () => {
    try {
        const response = await getCurrentEvents();
        events.value = response.data;
    } catch (error) {
        console.error('Failed to get events from backend!', error);
    }
});


</script>

<style scoped>
.page {
	display: flex;
	flex-flow: row wrap;
	justify-content: space-evenly;
	margin: 30px;
	gap: 15px;
}
.events {
    border-radius: 8px;
    min-width: 450px;
    height: 400px;
    overflow: auto;
    display: flex;
    flex-flow: column;
    gap: 5px;
}

.events > div {
    border-radius: 8px;
    margin: 5px;
    padding: 10px;
    box-shadow: 2px 2px 4px;
}

</style>