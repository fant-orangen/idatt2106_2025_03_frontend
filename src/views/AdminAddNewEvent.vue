<template>
<div style="margin:20px">
	<Breadcrumb>
		<BreadcrumbList>
			<BreadcrumbItem>
				<BreadcrumbLink href="/admin-panel">
				{{ $t('navigation.admin-panel') }}
				</BreadcrumbLink>
			</BreadcrumbItem>
			<BreadcrumbSeparator/><!--denne fungerer ikke for some reason??-->
			<BreadcrumbItem>
				<BreadcrumbPage href="/add-new-event">{{ $t('navigation.new-event') }}</BreadcrumbPage>
			</BreadcrumbItem>
		</BreadcrumbList>
	</Breadcrumb>
</div>





</template>

<script setup lang="ts">
</script>

<style scoped>
</style>