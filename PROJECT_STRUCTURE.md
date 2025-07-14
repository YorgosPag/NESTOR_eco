
# Project File System Structure

.
├── .env
├── .vscode/
│   └── settings.json
├── DATABASE_STRUCTURE.md
├── README.md
├── apphosting.yaml
├── components.json
├── firebase.json
├── firestore.indexes.json
├── index.html
├── next-env.d.ts
├── package.json
├── postcss.config.mjs
├── public/
│   ├── firebase-logo.png
│   ├── next.svg
│   └── vercel.svg
├── src/
│   ├── actions/
│   │   └── projects.ts
│   ├── ai/
│   │   ├── dev.ts
│   │   ├── flows/
│   │   │   ├── ai-smart-reminders.ts
│   │   │   ├── message-processor.ts
│   │   │   ├── reporting-flow.ts
│   │   │   └── schemas.ts
│   │   └── genkit.ts
│   ├── app/
│   │   ├── actions/
│   │   │   ├── admin.ts
│   │   │   ├── ai.ts
│   │   │   ├── contacts.ts
│   │   │   ├── database.ts
│   │   │   ├── interventions.ts
│   │   │   ├── offers.ts
│   │   │   └── projects.ts
│   │   ├── admin/
│   │   │   ├── custom-lists/
│   │   │   │   ├── client-page.tsx
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── calendar/
│   │   │   └── page.tsx
│   │   ├── contacts/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── dashboard-preview/
│   │   │   └── page.tsx
│   │   ├── error.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── print-test/
│   │   │   └── page.tsx
│   │   ├── projects/
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── work-order/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── work-order-detailed/
│   │   │   │       └── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   ├── page.tsx
│   │   │   ├── projects-client-page.tsx
│   │   │   └── work-order-batch/
│   │   │       ├── loading.tsx
│   │   │       └── page.tsx
│   │   ├── reports/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── supplier-offers/
│   │       ├── create-offer-dialog.tsx
│   │       ├── create-offer-form.tsx
│   │       ├── offers-table.tsx
│   │       ├── page.tsx
│   │       └── supplier-offers-client-page.tsx
│   ├── components/
│   │   ├── admin/
│   │   │   ├── admin-client-page.tsx
│   │   │   ├── create-intervention-dialog.tsx
│   │   │   ├── create-intervention-form.tsx
│   │   │   ├── custom-lists/
│   │   │   │   ├── create-item-dialog.tsx
│   │   │   │   ├── create-item-form.tsx
│   │   │   │   ├── create-list-dialog.tsx
│   │   │   │   ├── create-list-form.tsx
│   │   │   │   ├── custom-list-card.tsx
│   │   │   │   ├── custom-lists-manager.tsx
│   │   │   │   ├── delete-item-dialog.tsx
│   │   │   │   ├── delete-list-dialog.tsx
│   │   │   │   ├── edit-item-dialog.tsx
│   │   │   │   ├── edit-item-form.tsx
│   │   │   │   ├── edit-list-dialog.tsx
│   │   │   │   ├── edit-list-form.tsx
│   │   │   │   ├── list-item-columns.tsx
│   │   │   │   └── list-item-table.tsx
│   │   │   ├── delete-intervention-dialog.tsx
│   │   │   ├── edit-intervention-dialog.tsx
│   │   │   ├── edit-intervention-form.tsx
│   │   │   ├── editable-interventions-grid.tsx
│   │   │   ├── intervention-categories/
│   │   │   │   ├── categories-table.tsx
│   │   │   │   ├── category-columns.tsx
│   │   │   │   ├── create-category-dialog.tsx
│   │   │   │   ├── create-category-form.tsx
│   │   │   │   ├── delete-category-dialog.tsx
│   │   │   │   ├── edit-category-dialog.tsx
│   │   │   │   └── edit-category-form.tsx
│   │   │   ├── intervention-columns.tsx
│   │   │   ├── interventions-table.tsx
│   │   │   └── triggers/
│   │   │       ├── create-trigger-dialog.tsx
│   │   │       ├── create-trigger-form.tsx
│   │   │       ├── delete-trigger-dialog.tsx
│   │   │       ├── edit-trigger-dialog.tsx
│   │   │       ├── edit-trigger-form.tsx
│   │   │       ├── trigger-columns.tsx
│   │   │       └── triggers-table.tsx
│   │   ├── calendar/
│   │   │   └── calendar-view.tsx
│   │   ├── contacts/
│   │   │   ├── contacts-table.tsx
│   │   │   ├── create-contact-dialog.tsx
│   │   │   ├── create-contact-form.tsx
│   │   │   ├── delete-contact-dialog.tsx
│   │   │   ├── edit-contact-dialog.tsx
│   │   │   └── edit-contact-form.tsx
│   │   ├── dashboard/
│   │   │   ├── dashboard-client-page.tsx
│   │   │   ├── overview-chart.tsx
│   │   │   ├── project-card.tsx
│   │   │   └── upcoming-deadlines.tsx
│   │   ├── layout/
│   │   │   ├── firebase-error-display.tsx
│   │   │   ├── header.tsx
│   │   │   ├── instructions-dialog.tsx
│   │   │   ├── sidebar-context.ts
│   │   │   ├── sidebar-nav.tsx
│   │   │   ├── sidebar-provider.tsx
│   │   │   ├── theme-provider.tsx
│   │   │   ├── theme-toggle.tsx
│   │   │   └── troubleshooting-page.tsx
│   │   ├── projects/
│   │   │   ├── InterventionCard.tsx
│   │   │   ├── ProjectActions.tsx
│   │   │   ├── ProjectAlerts.tsx
│   │   │   ├── ProjectHeader.tsx
│   │   │   ├── add-intervention-dialog.tsx
│   │   │   ├── add-intervention-form.tsx
│   │   │   ├── add-stage-dialog.tsx
│   │   │   ├── add-stage-form.tsx
│   │   │   ├── add-sub-intervention-dialog.tsx
│   │   │   ├── add-sub-intervention-form.tsx
│   │   │   ├── assignee-report-dialog.tsx
│   │   │   ├── audit-log.tsx
│   │   │   ├── create-project-form.tsx
│   │   │   ├── delete-intervention-dialog.tsx
│   │   │   ├── delete-project-dialog.tsx
│   │   │   ├── delete-stage-dialog.tsx
│   │   │   ├── delete-sub-intervention-dialog.tsx
│   │   │   ├── description-selector.tsx
│   │   │   ├── edit-intervention-dialog.tsx
│   │   │   ├── edit-intervention-form.tsx
│   │   │   ├── edit-project-dialog.tsx
│   │   │   ├── edit-project-form.tsx
│   │   │   ├── edit-stage-dialog.tsx
│   │   │   ├── edit-stage-form.tsx
│   │   │   ├── edit-sub-intervention-dialog.tsx
│   │   │   ├── edit-sub-intervention-form.tsx
│   │   │   ├── file-upload-dialog.tsx
│   │   │   ├── intervention-pipeline.tsx
│   │   │   ├── notify-assignee-dialog.tsx
│   │   │   ├── project-details.tsx
│   │   │   ├── quotation-summary-card.tsx
│   │   │   ├── smart-reminder-dialog.tsx
│   │   │   ├── stage-card.tsx
│   │   │   └── work-order-view.tsx
│   │   ├── reports/
│   │   │   ├── ai-report-assistant.tsx
│   │   │   ├── dynamic-chart.tsx
│   │   │   ├── dynamic-report-builder.tsx
│   │   │   ├── financial-summary-report.tsx
│   │   │   └── reports-client-page.tsx
│   │   ├── shared/
│   │   │   └── GenericActionDialog.tsx
│   │   └── ui/
│   │       ├── accordion.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── alert.tsx
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── calendar.tsx
│   │       ├── card.tsx
│   │       ├── carousel.tsx
│   │       ├── chart.tsx
│   │       ├── checkbox.tsx
│   │       ├── collapsible.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── form.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── menubar.tsx
│   │       ├── multi-select-combobox.tsx
│   │       ├── popover.tsx
│   │       ├── progress.tsx
│   │       ├── radio-group.tsx
│   │       ├── scroll-area.tsx
│   │       ├── searchable-select.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── sidebar.tsx
│   │       ├── skeleton.tsx
│   │       ├── slider.tsx
│   │       ├── switch.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       ├── textarea.tsx
│   │       ├── toast.tsx
│   │       └── toaster.tsx
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   ├── use-sidebar.ts
│   │   └── use-toast.ts
│   └── lib/
│       ├── client-utils.ts
│       ├── contacts-data.ts
│       ├── custom-lists-data.ts
│       ├── data-helpers.ts
│       ├── data.ts
│       ├── firebase-admin.ts
│       ├── firebase.ts
│       ├── intervention-category-data.ts
│       ├── interventions-data.ts
│       ├── mock-data.ts
│       ├── offers-data.ts
│       ├── projects-data.ts
│       ├── text-utils.ts
│       ├── triggers-data.ts
│       └── utils.ts
├── tailwind.config.ts
└── tsconfig.json
`