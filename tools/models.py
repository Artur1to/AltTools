from django.db import models
from django.urls import reverse


class ToolCategory(models.Model):
    title = models.CharField(
        max_length=120,
        verbose_name='Название категории'
    )

    slug = models.SlugField(
        max_length=140,
        unique=True,
        verbose_name='URL категории'
    )

    description = models.TextField(
        blank=True,
        verbose_name='Описание категории'
    )

    icon = models.CharField(
        max_length=30,
        blank=True,
        verbose_name='Иконка'
    )

    sort_order = models.PositiveIntegerField(
        default=100,
        verbose_name='Порядок сортировки'
    )

    is_published = models.BooleanField(
        default=True,
        verbose_name='Опубликовано'
    )

    class Meta:
        verbose_name = 'Категория инструментов'
        verbose_name_plural = 'Категории инструментов'
        ordering = ['sort_order', 'title']

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse(
            'category_detail',
            kwargs={
                'category_slug': self.slug,
            }
        )


class ToolPage(models.Model):
    category = models.ForeignKey(
        ToolCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tools',
        verbose_name='Категория'
    )

    title = models.CharField(
        max_length=160,
        verbose_name='Название инструмента'
    )

    slug = models.SlugField(
        max_length=180,
        unique=True,
        verbose_name='URL инструмента'
    )

    h1 = models.CharField(
        max_length=180,
        verbose_name='H1 заголовок'
    )

    short_description = models.TextField(
        verbose_name='Краткое описание'
    )

    icon = models.CharField(
        max_length=30,
        blank=True,
        verbose_name='Иконка'
    )

    section = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Раздел внутри категории'
    )

    badge = models.CharField(
        max_length=80,
        blank=True,
        verbose_name='Бейдж / метка'
    )

    meta_title = models.CharField(
        max_length=180,
        verbose_name='SEO Title'
    )

    meta_description = models.TextField(
        verbose_name='SEO Description'
    )

    robots = models.CharField(
        max_length=50,
        default='index, follow',
        verbose_name='Robots'
    )

    related_tools = models.ManyToManyField(
        'self',
        blank=True,
        symmetrical=False,
        verbose_name='Похожие инструменты'
    )

    is_popular = models.BooleanField(
        default=False,
        verbose_name='Популярный инструмент'
    )

    is_published = models.BooleanField(
        default=True,
        verbose_name='Опубликовано'
    )

    sort_order = models.PositiveIntegerField(
        default=100,
        verbose_name='Порядок сортировки'
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата создания'
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Дата обновления'
    )

    class Meta:
        verbose_name = 'Страница инструмента'
        verbose_name_plural = 'Страницы инструментов'
        ordering = ['sort_order', 'title']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['is_published']),
            models.Index(fields=['is_popular']),
        ]

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse(
            'tool_detail',
            kwargs={
                'category_slug': self.category.slug,
                'tool_slug': self.slug,
            }
        )