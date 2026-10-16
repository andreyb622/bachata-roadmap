<script setup lang="ts">
import BottomSheet from '@/components/BottomSheet/BottomSheet.vue';

const open = defineModel<boolean>('open', { default: false });
</script>

<template>
  <BottomSheet v-model:open="open" title="О приложении">
    <div class="info-sheet">
      <div class="info-sheet__block">
        <div class="info-sheet__block-title">Что это</div>
        <p class="info-sheet__block-text">
          <strong>Bachata Roadmap</strong> — мобильное приложение с дорожной картой занятий:
          разминка, соло, элементы в паре и справочные блоки. Можно установить на экран «Домой» и
          пользоваться офлайн.
        </p>
      </div>

      <div class="info-sheet__block">
        <div class="info-sheet__block-title">Вкладки</div>
        <ul class="info-sheet__block-list">
          <li><strong>3 мес / 3–5 / 6+</strong> — программа по этапам обучения</li>
          <li><strong>Поиск</strong> — быстрый поиск элемента по названию или разделу</li>
          <li>
            <strong>📑 Элементы по блокам</strong> — сводный справочник по 5 модулям (в меню ☰)
          </li>
        </ul>
      </div>

      <div class="info-sheet__block">
        <div class="info-sheet__block-title">Чеклисты и прогресс</div>
        <ul class="info-sheet__block-list">
          <li>Нажмите на элемент, чтобы отметить его выполненным</li>
          <li>Повторное нажатие снимает отметку</li>
          <li>Над списком — <strong>прогресс-бар</strong> по текущему периоду</li>
          <li>В заголовке секции — счётчик <strong>выполнено / всего</strong></li>
        </ul>
      </div>

      <div class="info-sheet__block">
        <div class="info-sheet__block-title">Секции</div>
        <p class="info-sheet__block-text">
          Нажмите на заголовок раздела (Разминка, Элементы в паре и т.д.), чтобы свернуть или
          развернуть список.
        </p>
      </div>

      <div class="info-sheet__block">
        <div class="info-sheet__block-title">Поиск</div>
        <p class="info-sheet__block-text">
          Введите название фигуры или раздела. Нажмите на результат — приложение откроет нужную
          вкладку и период.
        </p>
      </div>

      <div class="info-sheet__block">
        <div class="info-sheet__block-title">Ученики и группы</div>
        <ul class="info-sheet__block-list">
          <li>
            В меню <strong>☰</strong> — список учеников и групп, создание, справочник и сброс
          </li>
          <li><strong>Ученики и группы</strong> — переключение, редактирование и удаление</li>
          <li><strong>Новый ученик / группа</strong> — отдельный прогресс для каждого</li>
          <li>Имя задаёте сами — это может быть человек или название группы</li>
          <li>У каждого свой прогресс и своя последняя вкладка</li>
        </ul>
      </div>

      <div class="info-sheet__block">
        <div class="info-sheet__block-title">Сохранение</div>
        <ul class="info-sheet__block-list">
          <li>
            Прогресс, список учеников и последняя вкладка сохраняются автоматически на устройстве
          </li>
          <li>После первого открытия приложение работает без интернета</li>
          <li>При каждом сохранении создаётся резервная копия на случай повреждения данных</li>
          <li>Обновление приложения <strong>не удаляет</strong> учеников и их прогресс</li>
        </ul>
      </div>

      <div class="info-sheet__block">
        <div class="info-sheet__block-title">Обновления</div>
        <p class="info-sheet__block-text">
          При выходе новой версии приложение подтягивает её само при следующем открытии или возврате
          на вкладку. Страница может перезагрузиться один раз — это нормально. Ваши данные при этом
          сохраняются.
        </p>
      </div>

      <div class="info-sheet__block">
        <div class="info-sheet__block-title">Если что-то пошло не так</div>
        <ul class="info-sheet__block-list">
          <li>Внизу экрана появляется короткое сообщение с объяснением</li>
          <li>Если данные повреждены — приложение попробует восстановить последнюю копию</li>
          <li>
            Если хранилище недоступно (режим инкогнито и т.п.) — прогресс не сохранится после
            перезагрузки
          </li>
          <li>Не хватает места на устройстве — освободите память в настройках браузера</li>
        </ul>
      </div>

      <div class="info-sheet__block">
        <div class="info-sheet__block-title">Установка на iPhone</div>
        <p class="info-sheet__block-text">
          Откройте ссылку в <strong>Safari</strong> → Поделиться → «На экран «Домой»». Не открывайте
          из приложения «Файлы» — там PWA не работает.
        </p>
      </div>

      <div class="info-sheet__block">
        <div class="info-sheet__block-title">Сброс прогресса</div>
        <p class="info-sheet__block-text">
          Кнопка <strong>↺</strong> в меню сбрасывает отметки только для
          <strong>текущего</strong> выбранного ученика или группы после подтверждения.
        </p>
      </div>
    </div>
  </BottomSheet>
</template>

<style scoped src="./InfoSheet.css"></style>
