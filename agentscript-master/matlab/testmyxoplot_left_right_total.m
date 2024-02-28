load('position (10).txt');
load('heading (10).txt');
heading__13_ = mod(heading__13_, 360);
% yL = 'empty'

[num_rows, num_columns] = size(position__13_);

for i = 2:num_rows
    t_i = i;
    row_positions = position__13_(i,:); % each row corresponds to a step, i.e. row 2 is the second step
    row_headings = heading__13_(i,:);
    left_positions = [];
    right_positions = [];

% Iterate through each position and heading
    for j = 1:numel(row_positions)
        % Check if heading corresponds to left or right movement
        if row_headings(j) > 91
            left_positions = [left_positions, row_positions(j)];
        else
            right_positions = [right_positions, row_positions(j)];
        end
    end

% Compute density estimates for left, right, and total movements
%if isempty(left_positions)
    %disp('initial conditions for each turtle is right facing')
%else
    [xL, yL, bw] = ksdensity(left_positions,"bandwidth",7,"BoundaryCorrection","reflection","Support",[-251,251]);
%end
[xR, yR, bw] = ksdensity(right_positions,"bandwidth",7,"BoundaryCorrection","reflection","Support",[-251,251]);
[x, y, bw] = ksdensity(row_positions,"bandwidth",7,"BoundaryCorrection","reflection","Support",[-251,251]);

% Plot density estimates

h = figure;
hold on
plot(y,x,'k','LineWidth',2)
plot(yR,xR,'r','LineWidth',2)
%if exist(yL, "var")
    plot(yL,xL,'b','LineWidth',2)
%end
hold off
title('','FontSize',16)
xlabel('','FontSize',16)
ylabel('','FontSize',16)
legend('Total density','Right-miving density','Left-moving density')

savefig(h,['density_plot_time_' num2str(t_i)])
% saveas(h,['density_plot_time_' num2str(t_i) '.fig'],'.fig'); 
% 'png is unsupported?

end