from django.contrib import admin
from .models import ToolCategory, ToolPage


@admin.register(ToolCategory)
class ToolCategoryAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'slug',
        'sort_order',
        'is_published',
    )
    list_editable = (
        'sort_order',
        'is_published',
    )
    search_fields = (
        'title',
        'slug',
        'description',
    )
    prepopulated_fields = {
        'slug': ('title',)
    }


@admin.register(ToolPage)
class ToolPageAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'slug',
        'category',
        'section',
        'badge',
        'is_popular',
        'is_published',
        'sort_order',
    )

    list_filter = (
        'category',
        'section',
        'is_popular',
        'is_published',
    )

    list_editable = (
        'section',
        'badge',
        'is_popular',
        'is_published',
        'sort_order',
    )

    search_fields = (
        'title',
        'slug',
        'h1',
        'short_description',
        'meta_title',
        'meta_description',
    )

    prepopulated_fields = {
        'slug': ('title',)
    }

    filter_horizontal = (
        'related_tools',
    )

    fieldsets = (
        ('Основное', {
            'fields': (
                'category',
                'title',
                'slug',
                'h1',
                'short_description',
                'icon',
            )
        }),
        ('Каталог и карточки', {
            'fields': (
                'section',
                'badge',
                'is_popular',
                'sort_order',
                'is_published',
            )
        }),
        ('SEO', {
            'fields': (
                'meta_title',
                'meta_description',
                'robots',
            )
        }),
        ('Похожие инструменты', {
            'fields': (
                'related_tools',
            )
        }),
    )