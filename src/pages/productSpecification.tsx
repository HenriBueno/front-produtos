import { CONFIG } from 'src/config-global';

import { ProductSpecificationView } from 'src/sections/productSpecification/view';


// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Especificações - ${CONFIG.appName}`}</title>

      <ProductSpecificationView />
    </>
  );
}
