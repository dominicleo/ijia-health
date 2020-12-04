import createMapper from 'map-factory';

function query(source = []): string[] {
  const mapper = createMapper();

  mapper.map('[].templateId').to('[]');

  return mapper.execute(source);
}

const SubscribeMapper = {
  query,
};

export default SubscribeMapper;
