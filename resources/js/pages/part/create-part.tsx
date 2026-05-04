import AppLayout from '@/layouts/app-layout';
import { Head, usePage, useForm, Link, router } from '@inertiajs/react';
import { type BreadcrumbItem, TestType } from '@/types';
import { FormEventHandler, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Editor } from '@tinymce/tinymce-react';
import { route } from 'ziggy-js';

export default function CreatePart() {
    const { testType } = usePage<{ testType: TestType }>().props;
    const { t } = useTranslation();  // Using the translation hook

    const editorRef = useRef<any>(null);

    // const logContent = () => {
    //     if (editorRef.current) {
    //         console.log(editorRef.current.getContent());
    //     }
    // };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('test'),
            href: '/dashboard'
        }
    ];

    const nameInput = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm<{
        test_type_id: number;
        name: string;
        textarea: string;
        minute: number | null;
        comment: string;
    }>({
        test_type_id: testType?.id,
        name: '',
        textarea: '',
        minute: null,
        comment: ''
    });


    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('part.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                toast.success(t('created_successfully'));
            },
            onError: (err) => {
                console.log(err);
                nameInput.current?.focus();
                // Display a friendly error message if available
                const errorMessage = err?.error || t('create_failed'); // Use fallback error message
                toast.error(errorMessage); // Display error message
            }
        });
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Test" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-y-auto">
                {/* Search and Per-Page Selection */}
                <div className="flex items-center justify-between">
                    <div className={''}>
                        <Link href={'/folder'} className={'underline'}>
                            {t('folder')} /
                        </Link>
                        <Link href={`/folder/${testType?.test?.folder?.id}`} className={'underline'}>
                            {testType?.test?.folder?.name} /
                        </Link>

                        <Link
                            href={`/test-type/${testType?.id}`}
                            className="underline"
                        >
                            {testType?.test?.name}
                        </Link>
                        / {testType?.type?.name}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">

                    <form onSubmit={submit} className="space-y-4">
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

                        <div>
                            <Label htmlFor="comment">{t('comment')}</Label>
                            <Input
                                id="comment"
                                ref={nameInput}
                                value={data.comment}
                                onChange={(e) => setData('comment', e.target.value)}
                            />
                            <InputError message={errors.comment} />
                        </div>


                        {/*<div>*/}
                        {/*    <Label htmlFor="minute">{t('minute')}</Label>*/}
                        {/*    <Input*/}
                        {/*        type="number"*/}
                        {/*        id="minute"*/}
                        {/*        value={data.minute ?? ''}*/}
                        {/*        onChange={(e) => setData('minute', Number(e.target.value))}*/}
                        {/*    />*/}
                        {/*    <InputError message={errors.minute} />*/}
                        {/*</div>*/}

                        <Editor
                            apiKey="2dze5jtbx912ir9l3xn1gmu90c06jnpomzy2lyypdq5xqcm8" // 👈 bo‘sh qoldirsangiz — community version (bepul)
                            onInit={(_evt, editor) => (editorRef.current = editor)}
                            initialValue=""

                            onEditorChange={(content) => setData('textarea', content)} // ✅ To‘g‘ri usul
                            init={{
                                height: 600,
                                menubar: 'file edit view insert format tools table help',
                                plugins: [
                                    'advlist', 'anchor', 'autolink', 'charmap', 'code', 'codesample',
                                    'directionality', 'emoticons', 'fullscreen', 'help', 'image',
                                    'importcss', 'insertdatetime', 'link', 'lists', 'media',
                                    'preview', 'searchreplace', 'table', 'visualblocks',
                                    'visualchars', 'wordcount'
                                ],
                                toolbar:
                                    'undo redo | blocks fontfamily fontsize | ' +
                                    'bold italic underline strikethrough forecolor backcolor | ' +
                                    'link image media table emoticons | alignleft aligncenter ' +
                                    'alignright alignjustify | bullist numlist outdent indent | ' +
                                    'removeformat | code fullscreen preview | help',
                                content_style: 'body { font-family:Arial,sans-serif; line-height:2; }'
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
                                onClick={() => router.visit(route('test-type.show', testType?.id))}
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
