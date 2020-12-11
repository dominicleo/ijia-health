import './index.less';

import classnames from 'classnames';
import * as React from 'react';

interface EllipsisProps {
  /** 样式名 */
  className?: string;
  /** (default: 3) 最多显示的行数 */
  rows?: number;
}

const Ellipsis: React.FC<EllipsisProps> = ({ className, rows, children }) => {
  const style: React.CSSProperties = rows ? { WebkitLineClamp: rows } : {};

  const cls = classnames('ellipsis-multiple-line', {
    [`${className}`]: !!className,
  });

  return (
    <div className={cls} style={style}>
      {children}
    </div>
  );
};

export default Ellipsis;
