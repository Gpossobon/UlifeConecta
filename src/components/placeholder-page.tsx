import { StaticDataNotice } from "./static-data-notice";

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="flex flex-col gap-3">
      <header className="bg-white px-4 py-4 border-b border-gray-100">
        <h1 className="text-lg text-gray-900">{title}</h1>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </header>
      <StaticDataNotice />
      <div className="mx-4 rounded-xl border border-dashed border-gray-300 bg-white px-5 py-10 text-center">
        <p className="text-sm text-gray-500">Esta tela ainda não foi incluída no material enviado.</p>
      </div>
    </section>
  );
}
