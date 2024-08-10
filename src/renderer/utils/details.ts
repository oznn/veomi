import { Details } from '../types';

export async function anilist(id: string): Promise<Details> {
  const query = `
query ($id: Int) {
  Media (id: $id, type: ANIME) {
    title{
      english
    }
    coverImage {
      extraLarge
    }
    studios(isMain: true){
      nodes {
          name
      }
    }
    status(version: 2)
    description(asHtml: false)
  }
}
`;

  const url = 'https://graphql.anilist.co';
  const body = JSON.stringify({ query, variables: { id } });
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  };
  const { data } = await (await fetch(url, options)).json();
  const { Media } = data;

  return {
    posterURL: Media.coverImage.extraLarge as string,
    status: Media.status as string,
    studio: Media.studios.nodes[0]?.name as string,
    description: Media.description as string,
  };
}

export const a = 1;
