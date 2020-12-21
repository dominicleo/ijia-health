import './index.less';

import classnames from 'classnames';
import * as React from 'react';

interface EllipsisProps {
  id?: string;
  /** 样式名 */
  className?: string;
  /** (default: 3) 最多显示的行数 */
  rows?: number;
}

const Ellipsis: React.FC<EllipsisProps> = ({ id, className, rows, children }) => {
  const cls = classnames('ellipsis-multiple-line', {
    [`${className}`]: !!className,
  });

  return (
    <div id={id} className={cls} style={{ WebkitLineClamp: rows }}>
      {children}
    </div>
  );
};

Ellipsis.defaultProps = {
  rows: 3,
};

export default Ellipsis;
