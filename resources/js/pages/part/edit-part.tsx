import AppLayout from '@/layouts/app-layout';
import { Head, usePage, useForm, Link, router } from '@inertiajs/react';
import { type BreadcrumbItem, Part } from '@/types';
import { FormEventHandler, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Editor } from '@tinymce/tinymce-react';
import { route } from 'ziggy-js';

export default function EditPart() {
    const { part } = usePage<{ part: Part }>().props;
    const { t } = useTranslation();

    const editorRef = useRef(null);
    const nameInput = useRef<HTMLInputElement>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('test'),
            href: '/dashboard',
        },
    ];

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm<{
        name: string;
        textarea: string;
        minute: number | null;
        comment: string;
    }>({
        name: part.name,
        textarea: part.textarea,
        minute: part.minute || null,
        comment: part.comment,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('part.update', part.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                toast.success(t('updated_successfully')); // ✅ correct message
            },
            onError: (err) => {
                console.error(err);
                nameInput.current?.focus();
                toast.error(err?.error || t('update_failed'));
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('edit_part')} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-y-auto">
                {/* Breadcrumbs */}
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/folder" className="underline">
                            {t('folder')} /
                        </Link>
                        <Link
                            href={`/folder/${part.test_type.test.folder.id}`}
                            className="underline"
                        >
                            {part.test_type.test.folder.name} /
                        </Link>

                        <Link
                            href={`/test-type/${part.test_type.id}`}
                            className="underline"
                        >
                            {part.test_type.test?.name}
                        </Link>

                        / {part.test_type.type?.name}
                    </div>
                </div>

                {/* Form */}
                <div className="overflow-x-auto">
                    <form onSubmit={submit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <Label htmlFor="name">{t('name')}</Label>
                            <Input
                                id="name"
                                ref={nameInput}
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            <InputError message={errors.name} />
                        </div>

                        {/* Comment */}
                        <div>
                            <Label htmlFor="comment">{t('comment')}</Label>
                            <Input
                                id="comment"
                                value={data.comment}
                                onChange={(e) => setData('comment', e.target.value)}
                            />
                            <InputError message={errors.comment} />
                        </div>

                        {/* Minute */}
                        {/*<div>*/}
                        {/*    <Label htmlFor="minute">{t('minute')}</Label>*/}
                        {/*    <Input*/}
                        {/*        type="number"*/}
                        {/*        id="minute"*/}
                        {/*        value={data.minute ?? ''} // null yoki undefined bo‘lsa, bo‘sh string chiqadi*/}
                        {/*        onChange={(e) =>*/}
                        {/*            setData('minute', e.target.value === '' ? null : Number(e.target.value))*/}
                        {/*        }*/}
                        {/*    />*/}
                        {/*    <InputError message={errors.minute} />*/}
                        {/*</div>*/}

                        {/* Textarea (TinyMCE Editor) */}
                        <Editor
                            apiKey="2dze5jtbx912ir9l3xn1gmu90c06jnpomzy2lyypdq5xqcm8"
                            onInit={(_evt, editor) => (editorRef.current = editor)}
                            initialValue={part.textarea} // ✅ keep existing content
                            onEditorChange={(content) => setData('textarea', content)}
                            init={{
                                height: 600,
                                menubar:
                                    'file edit view insert format tools table help',
                                plugins: [
                                    'advlist',
                                    'anchor',
                                    'autolink',
                                    'charmap',
                                    'code',
                                    'codesample',
                                    'directionality',
                                    'emoticons',
                                    'fullscreen',
                                    'help',
                                    'image',
                                    'importcss',
                                    'insertdatetime',
                                    'link',
                                    'lists',
                                    'media',
                                    'preview',
                                    'searchreplace',
                                    'table',
                                    'visualblocks',
                                    'visualchars',
                                    'wordcount',
                                ],
                                toolbar:
                                    'undo redo | blocks fontfamily fontsize | ' +
                                    'bold italic underline strikethrough forecolor backcolor | ' +
                                    'link image media table emoticons | alignleft aligncenter ' +
                                    'alignright alignjustify | bullist numlist outdent indent | ' +
                                    'removeformat | code fullscreen preview | help',
                                content_style:
                                    'body { font-family:Arial,sans-serif; line-height:2; }',
                            }}
                        />


                        <div className="flex gap-3">
                            {/* Primary Save */}
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 text-white hover:bg-blue-700
                   dark:bg-blue-500 dark:hover:bg-blue-600
                   disabled:opacity-50"
                            >
                                {t('save')}
                            </Button>

                            {/* Secondary Cancel */}
                            <Button
                                type="button"
                                onClick={() => router.visit(route('test-type.show', part.test_type_id))}
                                className="bg-gray-100 text-gray-800 hover:bg-gray-200
                   dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                            >
                                {t('cancel')}
                            </Button>
                        </div>


                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
