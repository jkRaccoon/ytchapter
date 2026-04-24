import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface Props {
  /** Korean path to link back to (e.g. "/guide") */
  koPath: string;
}

export default function MinimalEnNotice({ koPath }: Props) {
  const { t } = useTranslation();
  return (
    <section className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">{t('minimalEn.title')}</h1>
      <p className="mt-4 text-sm leading-relaxed text-slate-700">{t('minimalEn.body')}</p>
      <Link
        to={koPath}
        hrefLang="ko"
        className="mt-6 inline-block rounded-md border border-sky-600 bg-sky-600 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-700"
      >
        {t('minimalEn.linkLabel')}
      </Link>
    </section>
  );
}
